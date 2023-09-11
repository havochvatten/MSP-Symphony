import { Component, Input, NgModuleRef, OnDestroy, OnInit } from '@angular/core';
import { ChangesProperty, Scenario, ScenarioArea } from "@data/scenario/scenario.interfaces";
import { Store } from "@ngrx/store";
import { State } from "@src/app/app-reducer";
import { CalcOperation, CalculationService, NormalizationType } from "@data/calculation/calculation.service";
import { DialogService } from "@shared/dialog/dialog.service";
import { TranslateService } from "@ngx-translate/core";
import {
  AreaMatrixData,
  AreaTypeMatrixMapping,
  AreaTypeRef,
  MatrixParameters
} from "@src/app/map-view/scenario/scenario-area-detail/matrix-selection/matrix.interfaces";
import { environment } from "@src/environments/environment";
import { ScenarioActions, ScenarioSelectors, } from "@data/scenario";
import { Observable, Subscription } from "rxjs";
import { CalculationSelectors } from "@data/calculation";
import { ScenarioService } from "@data/scenario/scenario.service";
import { OperationParams } from "@data/calculation/calculation.interfaces";
import { fetchAreaMatrices } from "@data/scenario/scenario.actions";
import { transferChanges } from "@src/app/map-view/scenario/scenario-common";
import { MetadataSelectors } from "@data/metadata";

const availableOperationsByValue: Map<CalcOperation, string> = new Map<CalcOperation, string>(
  [ [CalcOperation.Cumulative, 'CumulativeImpact' ] ,
    [CalcOperation.RarityAdjusted, 'RarityAdjustedCumulativeImpact' ]]);

@Component({
  selector: 'app-scenario-area-detail',
  templateUrl: './scenario-area-detail.component.html',
  styleUrls: ['../scenario-detail/scenario-detail.component.scss',
              './scenario-area-detail.component.scss']
})
export class ScenarioAreaDetailComponent implements OnInit, OnDestroy {
  env = environment;

  @Input() scenario!: Scenario;
  @Input() areaIndex!: number;
  @Input() deleteDelegate!: ((a:number, e:MouseEvent, s:Scenario) => void);

  jsMath = Math;
  availableOperations = availableOperationsByValue;
  operation = CalcOperation;
  type = NormalizationType;
  areaCoastMatrices?: AreaTypeRef; // AreaMatrixMapping[] = [];
  associatedCoastalArea?: AreaTypeMatrixMapping;

  percentileValue$: Observable<number>;
  calculating$?: Observable<boolean>;
  areaFeatureName: string = '';
  locale = 'en';
  private matrixDataSubscription$: Subscription;
  bandDictionary$: Observable<{ [p: string]: string }>;

  constructor(
    private store: Store<State>,
    private calcService: CalculationService,
    private scenarioService: ScenarioService,
    private dialogService: DialogService,
    private translateService: TranslateService,
    private moduleRef: NgModuleRef<any>
  ) {
    const that = this;
    this.calculating$ = this.store.select(CalculationSelectors.selectCalculating);
    this.percentileValue$ = this.store.select(CalculationSelectors.selectPercentileValue);
    this.matrixDataSubscription$ = this.store.select(ScenarioSelectors.selectActiveAreaMatrixData).subscribe((matrixData: AreaMatrixData | null) => {
      if(matrixData) {
        const coastAreaType = matrixData.areaTypes.find(type => type.coastalArea);
        if (coastAreaType) {
          that.associatedCoastalArea = coastAreaType;
        }
      }
    });
    this.bandDictionary$ = this.store.select(MetadataSelectors.selectMetaDisplayDictionary);
    this.locale = this.translateService.currentLang;
  }

  ngOnDestroy(): void {
    this.matrixDataSubscription$.unsubscribe();
  }

  changes(): ChangesProperty | null {
    return this.area().changes;
  }

  ngOnInit(): void {
    this.areaFeatureName = this.area().feature.properties!['name'];

    if(this.associatedCoastalArea && this.associatedCoastalArea.areas.length > 0) {
      const includeCoast = this.area().excludedCoastal !== -1 && this.area().excludedCoastal !== this.associatedCoastalArea?.areas[0].id;
      this.onCheckIncludeCoast(includeCoast);
    }
  }

  area(): ScenarioArea {
    return this.scenario.areas[this.areaIndex];
  }

  onMatrixSelection(params: MatrixParameters) {
    this.store.dispatch(ScenarioActions.changeScenarioAreaMatrix(params));
  }

  getOptions() : OperationParams {
    return this.scenario.operationOptions ?? { 'domain' : 'GLOBAL' };
  }

  deleteChange = (bandId: string) => {
    this.store.dispatch(ScenarioActions.deleteAreaBandChange({ bandId }));
  }

  close() {
    this.store.dispatch(ScenarioActions.saveScenarioArea({ areaToBeSaved:this.area() }));
    this.store.dispatch(ScenarioActions.closeActiveScenarioArea());
    this.store.dispatch(fetchAreaMatrices({scenarioId: this.scenario.id}));
  }

  delete(event: MouseEvent) {
    this.deleteDelegate(this.area().id, event, this.scenario);
  }

  onCheckIncludeCoast(checked: boolean) {
    if (!checked && this.associatedCoastalArea) {
      this.areaCoastMatrices = {
        id: this.associatedCoastalArea.id,
        areaMatrices:  this.associatedCoastalArea.areas.map(area => ({
          areaId: area.id,
          matrixId: area.defaultMatrix.id
        }))
      };
      if(this.areaCoastMatrices.areaMatrices.length > 0) {
        this.store.dispatch(ScenarioActions.excludeActiveAreaCoastal(
          { areaId: this.areaCoastMatrices.areaMatrices[0].areaId }));
      }
    } else {
      this.store.dispatch(ScenarioActions.excludeActiveAreaCoastal({ areaId: null }));
    }
  }

  hasAssociatedCoastalArea() {
    return !!this.associatedCoastalArea;
  }

  async importChanges() {
    await transferChanges(this.dialogService, this.translateService, this.store, this.moduleRef, this.area());
  }
}
