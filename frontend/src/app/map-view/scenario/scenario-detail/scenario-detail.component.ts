import { Component, ElementRef, Input, NgModuleRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Scenario } from "@data/scenario/scenario.interfaces";
import { ScenarioActions, ScenarioSelectors } from "@data/scenario";
import { CalculationReportModalComponent } from "@shared/report-modal/calculation-report-modal.component";
import {
  AreaTypeMatrixMapping,
  AreaTypeRef,
  MatrixParameterResponse
} from "@src/app/map-view/scenario/scenario-detail/matrix-selection/matrix.interfaces";
import { CalculationActions, CalculationSelectors } from "@data/calculation";
import { MetadataSelectors } from "@data/metadata";
import { Observable, OperatorFunction, Subscription } from "rxjs";
import { Store } from "@ngrx/store";
import { environment } from "@src/environments/environment";
import * as Normalization
  from "@src/app/map-view/scenario/scenario-detail/normalization-selection/normalization-selection.component";
import { State } from "@src/app/app-reducer";
import { CalculationService, NormalizationOptions } from "@data/calculation/calculation.service";
import { Band } from "@data/metadata/metadata.interfaces";
import { DialogService } from "@shared/dialog/dialog.service";
import { convertMultiplierToPercent } from "@data/metadata/metadata.selectors";
import { debounceTime, filter, take, tap } from "rxjs/operators";
import { GeoJSONFeature } from "ol/format/GeoJSON";
import { fetchAreaMatrices } from "@data/scenario/scenario.actions";
import { AreaSelectors } from "@data/area";
import {
  DeleteScenarioConfirmationDialogComponent
} from "@src/app/map-view/scenario/scenario-detail/delete-scenario-confirmation-dialog/delete-scenario-confirmation-dialog.component";
import { Feature } from "geojson";
import { FormControl, Validators } from "@angular/forms";

const AUTO_SAVE_TIMEOUT = environment.editor.autoSaveIntervalInSeconds;

@Component({
  selector: 'app-scenario-detail',
  templateUrl: './scenario-detail.component.html',
  styleUrls: ['./scenario-detail.component.scss']
})
export class ScenarioDetailComponent implements OnInit, OnDestroy {
  env = environment;
  autoSaveSubscription$?: Subscription;

  @Input() scenario!: Scenario;
  @ViewChild('name') nameElement!: ElementRef;
  editName = false;

  calculating$?: Observable<boolean>;
  // Ambitiously we would query the backend for these
  availableOperations = ['CumulativeImpact', 'RarityAdjustedCumulativeImpact'];
  operation = new FormControl('', Validators.required);

  showIncludeCoastCheckbox = environment.showIncludeCoastCheckbox;
  associatedCoastalArea?: AreaTypeMatrixMapping;

  areaCoastMatrices?: AreaTypeRef; // AreaMatrixMapping[] = [];
  normalizationOpts = Normalization.DEFAULT_OPTIONS;

  constructor(
    private store: Store<State>,
    private calcService: CalculationService,
    private dialogService: DialogService,
    private moduleRef: NgModuleRef<any>
  ) {
    // https://stackoverflow.com/questions/59684733/how-to-access-previous-state-and-current-state-and-compare-them-when-you-subscri
    if (AUTO_SAVE_TIMEOUT) {
      this.autoSaveSubscription$ = this.store.select(ScenarioSelectors.selectActiveScenario).pipe(
        filter(s => s !== undefined) as OperatorFunction<Scenario | undefined, Scenario>,
        debounceTime(AUTO_SAVE_TIMEOUT*1000), // TODO use fixed interval instead
        tap((s: Scenario) => console.debug("Auto-saving scenario "+s.name))
      ).subscribe((_: Scenario) => this.save());
    }

    this.store.select(AreaSelectors.selectAreaMatrixData).subscribe(matrixData => {
      if (matrixData) {
        const coastAreaType = matrixData.areaTypes.find(type => type.coastalArea);
        if (coastAreaType) {
          this.associatedCoastalArea = coastAreaType;//.areas[0];
        }
      }
    });

    this.calculating$ = this.store.select(CalculationSelectors.selectCalculating);
  }

  convertMultiplierToPercent = convertMultiplierToPercent;

  ngOnInit() {
    if (!this.scenario)
      throw new Error("Attribute 'scenario' is required");

    // IDEA: Only to do this the first time a scenario is created?
    this.store.dispatch(fetchAreaMatrices({ geometry: this.scenario.feature.geometry }));

    // this.store.select(CalculationSelectors.selectCalculations).pipe(take(1)).subscribe(calculations => {
    if (this.scenario.latestCalculation && environment.editor.loadLatestCalculation) {
      // const latestCalc = calculations.find(c => c.id === this.scenario.latestCalculation)!;
      // if (latestCalc.timestamp>=this.scenario.timestamp)
      this.calcService.addResult(this.scenario.latestCalculation);
    }
    // });

    setTimeout(() => {
      this.operation.setValue(this.availableOperations[0]);
    });
  }

  calculate() {
    this.store.dispatch(CalculationActions.startCalculation());
    this.store.select(MetadataSelectors.selectSelectedComponents).pipe(
      take(1)
    ).subscribe((selectedComponents) => {
      const getSortedBandNumbers = (bands: Band[]) => bands
        .map(band => band.bandNumber)
        .sort((a, b) => a - b);
      this.calcService.calculate({
          ...this.scenario,
          ecosystemsToInclude: getSortedBandNumbers(selectedComponents.ecoComponent),
          pressuresToInclude: getSortedBandNumbers(selectedComponents.pressureComponent),
          matrix: {
            ...this.scenario.matrix,
            areaTypes: this.areaCoastMatrices ?
              [...(this.scenario.matrix!.areaTypes ?? []), this.areaCoastMatrices] :
              (this.scenario.matrix!.areaTypes ?? [])
          }
        },
        this.operation.value);
    });
  }

  onCheckIncludeCoast(checked: boolean) {
    if (checked) {
      this.areaCoastMatrices = {
        id: this.associatedCoastalArea!.id,
        areaMatrices:  this.associatedCoastalArea!.areas.map(area => ({
          areaId: area.id,
          matrixId: area.defaultMatrix.id
        }))
      };
    }
  }

  showReport(id: string) {
    this.dialogService.open(CalculationReportModalComponent, this.moduleRef, {
      data: { id }
    });
  }

  onAreaTypeSelection(params: MatrixParameterResponse) {
    // N.B: Ignore defaultMatrixId in response
    this.store.dispatch(ScenarioActions.changeScenarioAttribute({ attribute: 'matrix',
      value: {
        areaTypes: params.areaTypes,
        userDefinedMatrixId: undefined
      }
    }));
  }

  /** @param matrixId - id to use as user-defined matrix, or undefined to use area's default matrix */
  onMatrixOverride(matrixId: number|undefined) {
    this.store.dispatch(ScenarioActions.changeScenarioAttribute({ attribute: 'matrix',
      value: {
        areaTypes: undefined,
        userDefinedMatrixId: matrixId
      }
    }));
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
    this.store.dispatch(ScenarioActions.changeScenarioAttribute({
      attribute: 'normalization',
      value: opts
    }));
  }

  save() {
    this.store.dispatch(ScenarioActions.saveActiveScenario({ scenarioToBeSaved: this.scenario }));
  }

  hasChanges = () => this.scenario.changes?.features.length>0;

  // Can be used as condition for accordion box "open" attribute
  featureHasChanges(feature: GeoJSONFeature) {
    return feature.properties?.changes && Object.keys(feature.properties['changes']).length>0;
  }

  featureId = (index: number, item: GeoJSONFeature) => item.id!;

  deleteChange(featureIndex: number, bandId: string) {
    this.store.dispatch(ScenarioActions.deleteBandChangeOrChangeFeature({ featureIndex, bandId}));
  }

  close() {
    this.save();
    this.store.dispatch(ScenarioActions.closeActiveScenario());
    // cancel in-progress calculation??? - or popup confirmation dialog? - or just keep running in bg?
  }

  async delete() {
    const confirmation = await this.dialogService.open<boolean>(DeleteScenarioConfirmationDialogComponent, this.moduleRef, {
      data: { name: this.scenario.name }
    });
    if (confirmation)
      this.store.dispatch(ScenarioActions.deleteScenario({
        scenarioToBeDeleted: this.scenario
      }));
  }

  toggleFeatureVisibility(feature: Feature, featureIndex: number) {
    this.store.dispatch(ScenarioActions.toggleChangeAreaVisibility({ feature, featureIndex }));
  }

  ngOnDestroy() {
    this.autoSaveSubscription$?.unsubscribe();
  }
}
