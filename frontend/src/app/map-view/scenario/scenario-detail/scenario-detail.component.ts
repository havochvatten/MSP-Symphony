import { Component, ElementRef, Input, NgModuleRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms'
import { Observable, OperatorFunction, Subscription } from 'rxjs';
import { debounceTime, filter, map, take, tap } from 'rxjs/operators';
import { TranslateService } from "@ngx-translate/core";
import { Store } from '@ngrx/store';
import { some } from "lodash";
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
import { MetadataSelectors } from "@data/metadata";
import { Band } from "@data/metadata/metadata.interfaces";
import { ScenarioActions, ScenarioSelectors } from '@data/scenario';
import { fetchAreaMatrices } from "@data/scenario/scenario.actions";
import { ChangesProperty, Scenario } from '@data/scenario/scenario.interfaces';
import { convertMultiplierToPercent } from '@data/metadata/metadata.selectors';
import { ScenarioService } from "@data/scenario/scenario.service";
import { Area } from "@data/area/area.interfaces";
import { deleteScenario, transferChanges } from "@src/app/map-view/scenario/scenario-common";
import { AddScenarioAreasComponent } from "@src/app/map-view/scenario/add-scenario-areas/add-scenario-areas.component";
import { SensitivityMatrix } from "@src/app/map-view/scenario/scenario-area-detail/matrix-selection/matrix.interfaces";
import {
  ChangesOverviewComponent
} from "@src/app/map-view/scenario/changes-overview/changes-overview.component";

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

  @Input() scenario!: Scenario;
  @Input() deleteAreaDelegate!: ((a:number, e:MouseEvent, s:Scenario) => void);
  @ViewChild('name') nameElement!: ElementRef;
  editName = false;

  calculating$?: Observable<boolean>;
  availableOperations = availableOperations;
  operation = new FormControl('', Validators.required);
  private matrixDataSubscription$: Subscription | undefined;

  percentileValue$: Observable<number>;
  areaMatricesLoading$: Observable<boolean>;
  bandDictionary$: Observable<{ [p: string]: string }>;
  unsaved: boolean = false;
  savedByInteraction: boolean = false;

  constructor(
    private store: Store<State>,
    private calcService: CalculationService,
    private dialogService: DialogService,
    private translateService: TranslateService,
    private scenarioService: ScenarioService,
    private moduleRef: NgModuleRef<any>
  ) {
    // https://stackoverflow.com/questions/59684733/how-to-access-previous-state-and-current-state-and-compare-them-when-you-subscri
    if (AUTO_SAVE_TIMEOUT) {
      this.autoSaveSubscription$ = this.store
        .select(ScenarioSelectors.selectActiveScenario)
        .pipe(
          filter(s => s !== undefined) as OperatorFunction<Scenario | undefined, Scenario>,
          debounceTime(AUTO_SAVE_TIMEOUT * 1000), // TODO use fixed interval instead
          tap((s: Scenario) => console.debug('Auto-saving scenario ' + s.name))
        )
        .subscribe((_: Scenario) => { this.savedByInteraction = false; this.save() });
    }
    this.areaMatricesLoading$ = this.store.select(ScenarioSelectors.selectAreaMatrixDataLoading);
    this.calculating$ = this.store.select(CalculationSelectors.selectCalculating);
    this.percentileValue$ = this.store.select(CalculationSelectors.selectPercentileValue);
    this.bandDictionary$ = this.store.select(MetadataSelectors.selectMetaDisplayDictionary);
    this.store.dispatch(CalculationActions.fetchPercentile());
  }

  changes(): ChangesProperty {
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
      if(data !== null && !some(data, d => d === null)) {
        for(const area_id of Object.keys(data).map(id => parseInt(id))) {
          const area_ix = this.scenario.areas.findIndex(a => a.id == area_id),
                matrixData = data[area_id];
          if (!matrixData.defaultArea && matrixData.overlap.length > 0) {
            const selectedArea = await this.dialogService.open(SelectIntersectionComponent, this.moduleRef, {
              data: {
                areas: matrixData.overlap.map(overlap => {
                  return {
                    polygon: overlap.polygon,
                    metaDescription: overlap.defaultMatrix.name
                  }
                }),
                headerTextKey: 'map.editor.select-intersection.header',
                messageTextKey: 'map.editor.select-intersection.message',
                confirmTextKey: 'map.editor.select-intersection.confirm-selection',
                metaDescriptionTextKey: 'map.editor.select-intersection.default-matrix'
              }
            }) as number;
            if (selectedArea in matrixData.overlap) {
              this.store.dispatch(ScenarioActions.saveScenarioArea(
                { areaToBeSaved: { ...this.scenario.areas[area_ix],
                    feature: { ...this.scenario.areas[area_ix].feature, geometry: matrixData.overlap[selectedArea].polygon }
                  }}));
            } else {
              this.store.dispatch(ScenarioActions.closeActiveScenario());
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

    this.changesText = this.scenario.areas.map((a, ix) => {
        return Object.entries(a.changes || {}).map(([c, change]) => {
            return `${bandDict[c]}: ${
              change.multiplier ? (change.multiplier > 1 ? '+' : '') +
                Number(convertMultiplierToPercent(change.multiplier) * 100).toFixed(2) + '%' :
                change.offset
            }`;
        }).join('\n');
    });
  }

  calculate() {
    this.store.dispatch(CalculationActions.startCalculation());

    this.store.select(MetadataSelectors.selectSelectedComponents).pipe(
      take(1))
      .subscribe((selectedComponents: { ecoComponent: Band[]; pressureComponent: Band[]; }) => {
        const getSortedBandNumbers = (bands: Band[]) => bands
          .map(band => band.bandNumber)
          .sort((a, b) => a - b);
        this.scenarioService.save({...this.scenario,
          ecosystemsToInclude: getSortedBandNumbers(selectedComponents.ecoComponent),
          pressuresToInclude: getSortedBandNumbers(selectedComponents.pressureComponent)}).pipe(
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

    // TODO: investigate and fix to get rid of the "nudge" below.
    // Angular seems to be having some trouble with updating nested components
    // through input properties after programmatically triggered events.
    // In this case we emit a custom modeSelectionEvent to disallow the domain
    // normalization by percentage option for rarity adjusted calculations.

    // Sort of an anti-pattern anyway, also a little unclear why we don't simply
    // dispatch directly instead of emitting a synthetic event.

    setTimeout(() => {
      this.scenario = this.scenario;
    });
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

  deleteChange = (bandId: string) => {
    this.unsaved = true;
    this.store.dispatch(ScenarioActions.deleteBandChange({ bandId }));
  }

  close() {
    this.save();
    this.store.dispatch(ScenarioActions.closeActiveScenario());
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
    this.unsaved ||= await this.dialogService.open<boolean>(ChangesOverviewComponent, this.moduleRef, {
      data: {
        scenario: this.scenario,
      }
    });
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

  anyChanges() {
    return  (this.scenario.changes && Object.keys(this.scenario.changes).length > 0) ||
             this.scenario.areas.some(a => a.changes && Object.keys(a.changes!).length > 0);
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

  getDisplayName(bandId: string): Observable<string> {
    return this.bandDictionary$.pipe(map((bandDictionary) => bandDictionary[bandId]));
  }
}
