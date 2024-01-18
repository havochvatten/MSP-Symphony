import { Component, ElementRef, Input, NgModuleRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms'
import { Observable, OperatorFunction, Subscription } from 'rxjs';
import { debounceTime, filter, take, tap } from 'rxjs/operators';
import { TranslateService } from "@ngx-translate/core";
import { Store } from '@ngrx/store';
import { isEmpty, some } from "lodash";
import { State } from '@src/app/app-reducer';
import { environment } from '@src/environments/environment';
import { DialogService } from '@shared/dialog/dialog.service';
import { turfIntersects } from "@shared/turf-helper/turf-helper";
import { CalculationReportModalComponent } from '@shared/report-modal/calculation-report-modal.component';
import { SelectIntersectionComponent } from "@shared/select-intersection/select-intersection.component";
import { CalculationActions, CalculationSelectors } from '@data/calculation';
import { OperationParams } from '@data/calculation/calculation.interfaces';
import {
  CalcOperation,
  CalculationService,
  NormalizationOptions,
  NormalizationType
} from '@data/calculation/calculation.service';
import { MetadataActions, MetadataSelectors } from "@data/metadata";
import { Band, BandType } from "@data/metadata/metadata.interfaces";
import { ScenarioActions, ScenarioSelectors } from '@data/scenario';
import { fetchAreaMatrices } from "@data/scenario/scenario.actions";
import {
  ChangesProperty,
  Scenario, ScenarioArea, ScenarioSplitDialogResult
} from '@data/scenario/scenario.interfaces';
import { convertMultiplierToPercent } from '@data/metadata/metadata.selectors';
import { ScenarioService } from "@data/scenario/scenario.service";
import { Area } from "@data/area/area.interfaces";
import { deleteScenario, transferChanges } from "@src/app/map-view/scenario/scenario-common";
import { AddScenarioAreasComponent } from "@src/app/map-view/scenario/add-scenario-areas/add-scenario-areas.component";
import {
  ChangesOverviewComponent
} from "@src/app/map-view/scenario/changes-overview/changes-overview.component";
import {
  SplitScenarioSettingsComponent
} from "@src/app/map-view/scenario/split-scenario-settings/split-scenario-settings.component";
import { MatrixRef } from "@src/app/map-view/scenario/scenario-area-detail/matrix-selection/matrix.interfaces";
import {
  SetArbitraryMatrixComponent
} from "@src/app/map-view/scenario/set-arbitrary-matrix/set-arbitrary-matrix.component";

const AUTO_SAVE_TIMEOUT = environment.editor.autoSaveIntervalInSeconds;

const availableOperations: Map<string, CalcOperation> = new Map<string, CalcOperation>(
  [ ['CumulativeImpact', CalcOperation.Cumulative ] ,
    ['RarityAdjustedCumulativeImpact', CalcOperation.RarityAdjusted ]]);

@Component({
  selector: 'app-scenario-detail',
  templateUrl: './scenario-detail.component.html',
  styleUrls: ['./scenario-detail.component.scss']
})
export class ScenarioDetailComponent implements OnInit, OnDestroy {
  env = environment;
  autoSaveSubscription$?: Subscription;
  changesText: { [key: number]: string; } = {};

  replacedAreaIds: number[] = [];

  @Input() scenario!: Scenario;
  @Input() deleteAreaDelegate!: ((a:number, e:MouseEvent, s:Scenario) => void);
  @Input() deleteAreaAction! : (a:number, s:Scenario) => void;
  @ViewChild('name') nameElement!: ElementRef;
  editName = false;

  calculating$?: Observable<boolean>;
  availableOperations = availableOperations;
  operation = new FormControl('', Validators.required);
  private matrixDataSubscription$: Subscription | undefined;

  percentileValue$: Observable<number>;
  areaMatricesLoading$: Observable<boolean>;
  bandDictionary$: Observable<{ [k: string] : { [p: string]: string } }>;
  unsaved = false;
  savedByInteraction = false;

  constructor(
    private store: Store<State>,
    private calcService: CalculationService,
    private dialogService: DialogService,
    private translateService: TranslateService,
    private scenarioService: ScenarioService,
    private moduleRef: NgModuleRef<never>
  ) {
    // https://stackoverflow.com/questions/59684733/how-to-access-previous-state-and-current-state-and-compare-them-when-you-subscri
    if (AUTO_SAVE_TIMEOUT) {
      this.autoSaveSubscription$ = this.store
        .select(ScenarioSelectors.selectActiveScenario)
        .pipe(
          filter(s => s !== undefined) as OperatorFunction<Scenario | undefined, Scenario>,
          debounceTime(AUTO_SAVE_TIMEOUT * 1000), // TODO use fixed interval instead
          tap((s: Scenario) => console.info('Auto-saving scenario ' + s.name))
        )
        .subscribe((_: Scenario) => { this.savedByInteraction = false; this.save() });
    }
    this.areaMatricesLoading$ = this.store.select(ScenarioSelectors.selectAreaMatrixDataLoading);
    this.calculating$ = this.store.select(CalculationSelectors.selectCalculating);
    this.percentileValue$ = this.store.select(CalculationSelectors.selectPercentileValue);
    this.bandDictionary$ = this.store.select(MetadataSelectors.selectMetaDisplayDictionary);
     this.store.select(ScenarioSelectors.selectActiveScenario).subscribe(
        async (scenario) => {
            if (scenario) {
            this.scenario = scenario;
            this.operation.setValue([...availableOperations.keys()][this.scenario.operation]);
            await this.setChangesText();
            }
        });
    this.store.dispatch(CalculationActions.fetchPercentile());
  }

  changes(): { [ bandType: string ]:  ChangesProperty } {
    return this.scenario.changes;
  }

  async ngOnInit() {
    if (!this.scenario)
      throw new Error("Attribute 'scenario' is required");

    setTimeout(() => {
      this.operation.setValue([...availableOperations.keys()][this.scenario.operation]);
    });

    await this.setChangesText();

    this.matrixDataSubscription$ = this.store.select(ScenarioSelectors.selectAreaMatrixData).subscribe(
      async data => {
        if (data !== null && !some(data, d => d === null)) {
          for (const area_id of Object.keys(data).map(id => +id)) {
            const matrixData = data[area_id];
            if (!matrixData.defaultArea) {
              const area = this.scenario.areas[this.scenario.areas.findIndex(a => a.id === area_id)];

              // Bring up a dialog to select an arbitrary matrix and a calculationarea (for value normalization)
              // if no default matrix is found and no matrix has been set previously.
              // This circumstance should be considered an 'edge case' which could occur for user-defined/imported
              // area polygons that are entirely outside of a default (MSP) area.
              // matrixData.alternativeMatrices indicates that no default matrix was found
              // matrixId would be defined if the user has already selected a matrix
              if (area && !area.matrix.matrixId && matrixData.alternativeMatrices !== null) {
                const response = (await this.dialogService.open(SetArbitraryMatrixComponent, this.moduleRef, {
                  data: {
                    areaName: area.feature.properties && area.feature.properties['name'] ?
                      area.feature.properties['name'] : '??',
                    matrices: matrixData.alternativeMatrices,
                    // TODO: more pragmatic percentile value access applicationwide, this seems convoluted
                    percentileValue: await this.percentileValue$.pipe(take(1)).toPromise()
                  }
                }) as [MatrixRef, number] | null);
                if (response) {
                  const [ selectedMatrix, selectedCalcAreaId ] = response;
                  this.store.dispatch(ScenarioActions.setArbitraryScenarioAreaMatrixAndNormalization(
                    {areaId: area_id, matrixId: selectedMatrix.id, calcAreaId: selectedCalcAreaId}));
                } else {
                  this.deleteAreaAction(area_id, this.scenario);
                }
              }
            }

            if (matrixData.overlap.length > 0 && !this.replacedAreaIds.includes(area_id)) {
              this.replacedAreaIds.push(area_id);
              const selectedAreas = (await this.dialogService.open(SelectIntersectionComponent, this.moduleRef, {
                data: {
                  areas: matrixData.overlap.map(overlap => {
                    return {
                      polygon: overlap.polygon,
                      metaDescription: overlap.defaultMatrix.name
                    }
                  }),
                  multi: true,
                  headerTextKey: 'map.editor.select-intersection.header',
                  messageTextKey: 'map.editor.select-intersection.message',
                  confirmTextKey: 'map.editor.select-intersection.confirm-selection',
                  metaDescriptionTextKey: 'map.editor.select-intersection.default-matrix'
                }
              }) as boolean[]).filter(a => a);

              if (selectedAreas.length > 0) {
                const replacementAreas: ScenarioArea[] = selectedAreas.map((selectedArea, ix) => {
                  const area = this.scenario.areas[this.scenario.areas.findIndex(a => a.id === area_id)];
                  return {
                    ...area,
                    id: -1,
                    feature: {
                      ...area.feature,
                      geometry: matrixData.overlap[ix].polygon,
                      properties: {...area.feature.properties, statePath: []}
                    },
                    matrix: {matrixType: 'STANDARD', matrixId: matrixData.overlap[ix].defaultMatrix.id}
                  }
                });

                this.store.dispatch(ScenarioActions.splitAndReplaceScenarioArea(
                  {scenarioId: this.scenario.id, replacedAreaId: area_id, replacementAreas: replacementAreas}));

              } else {
                if (this.scenario.areas.filter(a => a.id !== area_id).length > 0) {
                  this.store.dispatch(ScenarioActions.closeActiveScenario());
                } else {
                  this.store.dispatch(ScenarioActions.deleteScenarioArea({areaId: area_id}));
                }
              }
            }
          }
        }
    });

    this.store.dispatch(fetchAreaMatrices({ scenarioId: this.scenario.id }));
  }

  getChangesText(areaIndex: number): string {
    return this.changesText[areaIndex];
  }

  async setChangesText():Promise<void> {
    const bandDict = await this.bandDictionary$.pipe(take(1)).toPromise();
    this.changesText = this.scenario.areas.some((a) => !isEmpty(a.changes)) ?
        this.scenario.areas.map((a) => {
          return Object.entries(a.changes || {}).map(([bandType, c]) => {
            return Object.entries(c).map(([bandNumber, change]) => {
              return `${bandDict[bandType][bandNumber]}: ${change.multiplier ? (change.multiplier > 1 ? '+' : '') +
                  Number(convertMultiplierToPercent(change.multiplier) * 100).toFixed(2) + '%' :
                  change.offset! > 0 ? '+' + change.offset : change.offset
              }`;
            }).join('\n');
          }).join('\n');
        }) : {};
  }

  calculate() {
    this.store.dispatch(CalculationActions.startCalculation());

    // TODO: call service through rxjs effect and avoid code repetition (ScenarioEffects)
    this.store.select(MetadataSelectors.selectSelectedComponents).pipe(
      take(1))
      .subscribe((selectedComponents: { ecoComponent: Band[]; pressureComponent: Band[]; }) => {
        const sortedBandNumbers = (bands: Band[]) => bands
          .map(band => band.bandNumber)
          .sort((a, b) => a - b);
        this.scenarioService.save({...this.scenario,
          ecosystemsToInclude: sortedBandNumbers(selectedComponents.ecoComponent),
          pressuresToInclude: sortedBandNumbers(selectedComponents.pressureComponent)}).pipe(
          take(1))
          .subscribe(() => {
              this.calcService.calculate(this.scenario);
            }
          );
      });
  }

  onCheckRarityIndicesDomain(domain: string) {
    this.unsaved = true;
    this.store.dispatch(ScenarioActions.changeScenarioOperationParams({ operationParams: { domain } }));
  }

  getParams() : OperationParams {
    return this.scenario.operationOptions ?? { 'domain' : 'GLOBAL' };
  }

  getNormalizationOptions() : NormalizationOptions {
    return this.scenario.normalization;
  }

  showReport(id: string) {
    this.dialogService.open(CalculationReportModalComponent, this.moduleRef, {
      data: { id }
    });
  }

  addScenarioArea(selectedAreas: Area[], that: AddScenarioAreasComponent) {
    const areas = selectedAreas.filter(a => !some(that.scenario!.areas,
        s => turfIntersects(that.format.readFeature(a.feature), that.format.readFeature(s.feature))));
    this.unsaved = true;
    this.store.dispatch(ScenarioActions.addAreasToActiveScenario({ areas: that.scenarioService.convertAreas(areas) }));
  }

  editTheName() {
    this.editName = !this.editName;
    setTimeout(() => this.nameElement.nativeElement.focus(), 0);
  }

  onChangeName(name: string) {
    this.editName = !this.editName;
    this.unsaved = true;
    setTimeout(() => this.store.dispatch(ScenarioActions.changeScenarioName({ name })));
  }

  setNormalizationOptions(opts: NormalizationOptions) {
    this.unsaved = true;
    this.store.dispatch(ScenarioActions.changeScenarioNormalization({ normalizationOptions: opts }));
  }

  saveImmediate() {
    this.savedByInteraction = true;
    this.save();
    setTimeout(() => this.savedByInteraction = false, 30000);
  }

  save() {
    this.unsaved = false;
    this.store.dispatch(ScenarioActions.saveActiveScenario({ scenarioToBeSaved: this.scenario }));
  }

  deleteChange = (bandTypeString: string, bandNumber: number) => {
    this.unsaved = true;
    const componentType = bandTypeString as BandType;
    this.store.dispatch(ScenarioActions.deleteBandChange({ componentType, bandNumber }));
  }

  close() {
    this.save();
    this.store.dispatch(ScenarioActions.closeActiveScenario());
    this.store.dispatch(MetadataActions.fetchMetadata());
  }

  async delete () {
    await deleteScenario(this.dialogService, this.translateService, this.store, this.moduleRef, this.scenario);
  }

  ngOnDestroy() {
    this.autoSaveSubscription$?.unsubscribe();
    this.matrixDataSubscription$?.unsubscribe();
  }

  openScenarioArea(areaIndex: number) {
    this.store.dispatch(ScenarioActions.openScenarioArea({ index: areaIndex, scenarioIndex: null }));
  }

  async openIntensityOverview() {
    const intensityChanged = await this.dialogService.open<boolean>(ChangesOverviewComponent, this.moduleRef, {
      data: {
        scenario: this.scenario,
      }
    });

    this.unsaved ||= intensityChanged;
    this.setChangesText();
  }

  setOperation() {
    const operation = availableOperations.get(this.operation.value!)!;
    this.store.dispatch(ScenarioActions.changeScenarioOperation({ operation: operation }));
    this.unsaved = true;
    if(operation === CalcOperation.RarityAdjusted) {
      const normalizationOptions = this.getNormalizationOptions();
      this.store.dispatch(ScenarioActions.changeScenarioOperationParams({operationParams: this.getParams() ? this.getParams() : {'domain': 'GLOBAL'}}));
      if(normalizationOptions.type === NormalizationType.Domain) {
        this.store.dispatch(ScenarioActions.changeScenarioNormalization(
          { normalizationOptions: {...normalizationOptions, type: NormalizationType.Area } }
        ));
      }
    }
  }

  anyChanges(): boolean {
    return !!this.scenario.changes &&
            Object.values(this.scenario.changes).flatMap(x => Object.values(x)).length > 0;
  }

  async importChanges() {
    const changesImported =
      await transferChanges(this.dialogService, this.translateService, this.store, this.moduleRef, this.scenario);
    if(changesImported) {
      // importing changes saves implicitly
      this.savedByInteraction = false;
      this.unsaved = false;
      await this.setChangesText();
    }
  }

  async openSplitDialog(): Promise<void> {
    const splitDialogResult = await this.dialogService.open<ScenarioSplitDialogResult>(
      SplitScenarioSettingsComponent,
      this.moduleRef,
      { data: {
          scenarioName: this.scenario.name,
          areaSpecificChanges:
            this.scenario.areas.some(a => a.changes && Object.keys(a.changes!).length > 0),
          confirmText: this.translateService.instant('map.editor.split-scenario-settings.generate')
        }}
    );

    if (splitDialogResult) {
      if(splitDialogResult.immediate) {
        this.calcService.queueBatchCalculation([this.scenario.id], splitDialogResult.options);
      } else {
        if(splitDialogResult.options.batchSelect) {
          this.store.dispatch(ScenarioActions.closeActiveScenario());
        }
        this.store.dispatch(ScenarioActions.splitScenarioForBatch(
          { scenarioId : this.scenario.id, options: splitDialogResult.options }));
      }
    }
  }

  protected readonly isEmpty = isEmpty;
}
