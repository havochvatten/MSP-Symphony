import { Component, ElementRef, Input, NgModuleRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ChangesProperty, Scenario } from '@data/scenario/scenario.interfaces';
import { ScenarioActions, ScenarioSelectors } from '@data/scenario';
import { CalculationReportModalComponent } from '@shared/report-modal/calculation-report-modal.component';
import {
  AreaTypeMatrixMapping,
  AreaTypeRef
} from '@src/app/map-view/scenario/scenario-area-detail/matrix-selection/matrix.interfaces';
import { CalculationActions, CalculationSelectors } from '@data/calculation';
import { Observable, OperatorFunction, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { environment } from '@src/environments/environment';
import { State } from '@src/app/app-reducer';
import {
  CalcOperation,
  CalculationService,
  NormalizationOptions,
  NormalizationType
} from '@data/calculation/calculation.service';
import { DialogService } from '@shared/dialog/dialog.service';
import { convertMultiplierToPercent } from '@data/metadata/metadata.selectors';
import { debounceTime, filter, take, tap } from 'rxjs/operators';
import { ConfirmationModalComponent } from "@shared/confirmation-modal/confirmation-modal.component";
import { Feature } from 'geojson';
import { FormControl, Validators } from '@angular/forms';
import { OperationParams } from '@data/calculation/calculation.interfaces';
import { availableOperations } from "@data/calculation/calculation.util";
import { TranslateService } from "@ngx-translate/core";
import { MetadataSelectors } from "@data/metadata";
import { Band } from "@data/metadata/metadata.interfaces";
import { ScenarioService } from "@data/scenario/scenario.service";
import { SelectIntersectionComponent } from "@shared/select-intersection/select-intersection.component";
import { fetchAreaMatrices } from "@data/scenario/scenario.actions";
import { some } from "lodash";
import { deleteScenario } from "@src/app/map-view/scenario/scenario-common";

const AUTO_SAVE_TIMEOUT = environment.editor.autoSaveIntervalInSeconds;

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
        .subscribe((_: Scenario) => this.save());
    }

    this.areaMatricesLoading$ = this.store.select(ScenarioSelectors.selectAreaMatrixDataLoading);
    this.calculating$ = this.store.select(CalculationSelectors.selectCalculating);
    this.percentileValue$ = this.store.select(CalculationSelectors.selectPercentileValue);
    this.store.dispatch(CalculationActions.fetchPercentile());
  }

  changes(): ChangesProperty {
    return this.scenario.changes;
  }

  ngOnInit() {
    if (!this.scenario)
      throw new Error("Attribute 'scenario' is required");

    setTimeout(() => {
      this.operation.setValue([...availableOperations.keys()][this.scenario.operation]);
    });

    this.setChangesText();

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

  setChangesText():void {
    for(const [ix, a] of this.scenario.areas.entries()) {
      this.changesText[ix] = '';
      for(const c in a.changes) {
        let change = a.changes[c];
        this.changesText[ix] += '\n' + c + ': ';
        if (change['multiplier']) {
          this.changesText[ix] +=
            (change['multiplier'] > 1 ? '+' : '') +
            Number(convertMultiplierToPercent(change['multiplier']) * 100).toFixed(2) + '%';
        } else if (change['offset']) {
          this.changesText[ix] += change['offset'];
        }
      }
    }
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


  editTheName() {
    this.editName = !this.editName;
    setTimeout(() => this.nameElement.nativeElement.focus(), 0);
  }

  onChangeName(name: string) {
    this.editName = !this.editName;
    setTimeout(() => this.store.dispatch(ScenarioActions.changeScenarioName({ name })));
  }

  setNormalizationOptions(opts: NormalizationOptions) {
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

  save() {
    this.store.dispatch(ScenarioActions.saveActiveScenario({ scenarioToBeSaved: this.scenario }));
  }

  deleteChange = (bandId: string) => {
    this.store.dispatch(ScenarioActions.deleteBandChange({ bandId }));
  }

  close() {
    this.save();
    this.store.dispatch(ScenarioActions.closeActiveScenario());
  }

  async delete () {
    await deleteScenario(this.dialogService, this.translateService, this.store, this.moduleRef, this.scenario);

    // const confirmDelete = await this.dialogService.open<boolean>(
    //   ConfirmationModalComponent, this.moduleRef,
    //   { data: {
    //             header: `${ this.translateService.instant('map.editor.delete.modal.title', { scenario: this.scenario.name })}`,
    //             confirmText: this.translateService.instant('map.editor.delete.modal.delete'),
    //             confirmColor: 'warn',
    //             dialogClass: 'center'
    //           }
    //         });
    // if (confirmDelete) {
    //   this.store.dispatch(ScenarioActions.closeActiveScenarioArea());
    //   this.store.dispatch(ScenarioActions.deleteScenario({
    //     scenarioToBeDeleted: this.scenario
    //   }));
    // }
  }

  toggleFeatureVisibility(feature: Feature, featureIndex: number) {
    this.store.dispatch(ScenarioActions.toggleChangeAreaVisibility({ feature, featureIndex }));
  }

  ngOnDestroy() {
    this.autoSaveSubscription$?.unsubscribe();
    this.matrixDataSubscription$?.unsubscribe();
  }

  openScenarioArea(areaIndex: number) {
    this.store.dispatch(ScenarioActions.openScenarioArea({ index: areaIndex, scenarioIndex: null }));
  }

  setOperation() {
    const operation = availableOperations.get(this.operation.value!)!;
    this.store.dispatch(ScenarioActions.changeScenarioOperation({ operation: operation }));
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


}
