import { Component, EventEmitter, Input, NgModuleRef, OnDestroy, Output, ViewChild } from '@angular/core';
import {
  Area,
  AreaTypeMatrixMapping,
  DefaultArea,
  MatrixRef,
  SensitivityMatrix, MatrixParameterResponse
} from "./matrix.interfaces";
import { MatrixTableComponent } from './matrix-table/matrix-table.component';
import { DialogService } from '@shared/dialog/dialog.service';
import { Store } from '@ngrx/store';
import { State } from '@src/app/app-reducer';
import { AreaActions, AreaSelectors } from "@data/area";
import { TranslateService } from "@ngx-translate/core";
import { MatrixService } from './matrix.service';
import { ScenarioActions, ScenarioSelectors } from "@data/scenario";
import { Subscription } from "rxjs";
import { MatSelect } from "@angular/material/select";
import { GeoJSONFeature } from "ol/format/GeoJSON";

type MatrixOption = 'STANDARD' | 'CUSTOM' | 'OPTIONAL';

@Component({
  selector: 'app-matrix-selection',
  templateUrl: './matrix-selection.component.html',
  styleUrls: ['./matrix-selection.component.scss']
})
// TODO We would like to deserialize the matrix options from the scenario so as not to have to load them each time
// the scenario is opened. But still need to fetch matrices from server (but perhaps in background, i.e. no spinner?)
export class MatrixSelectionComponent implements OnDestroy {
  matrixOption: MatrixOption = 'STANDARD';
  loaded = false;
  loadingMatrix = false;
  areaTypes: AreaTypeMatrixMapping[] = []; // get from input?
  defaultArea?: DefaultArea;
  selectedAreaType?: AreaTypeMatrixMapping;
  firstAreaOfSelectedAreaType?: Area;
  areaTypeMatrixOptions: MatrixRef[] = [];
  selectedCustomMatrix?: MatrixRef;
  @Input() feature!: GeoJSONFeature; // needed as parameter for refreshing matrices after deletion
  @Output() areaTypeSelected = new EventEmitter<MatrixParameterResponse>();
  @Output() matrixOverridden = new EventEmitter<number|undefined>(); // id of user-defined matrix
  @ViewChild('altMx') altMatrixSelect: MatSelect | undefined;
  @ViewChild('usrMx') userMatrixSelect: MatSelect| undefined;
  @ViewChild('typeMx') typeMatrixSelect: MatSelect | undefined;
  private defaultMatrixTranslation?: string;
  private matrixDataLoadingSubcription: Subscription;
  private matrixDataSubcription: Subscription;

  constructor(
    private translateService: TranslateService,
    private matrixService: MatrixService,
    private dialogService: DialogService,
    private moduleRef: NgModuleRef<any>,
    private store: Store<State>
  ) {
    this.translateService.get('map.editor.matrix.default-matrix').subscribe(res => {
      this.defaultMatrixTranslation = res;
    });

    this.matrixDataSubcription = this.store.select(AreaSelectors.selectAreaMatrixData).subscribe(data => {
      if (data) {
        this.defaultArea = data.defaultArea;
        this.areaTypeSelected.emit({
          defaultMatrixId: this.defaultArea.defaultMatrix.id,
          areaTypes: []});
        this.areaTypes = data.areaTypes.filter(type => !type.coastalArea);
      }
    });

    this.matrixDataLoadingSubcription = this.store.select(ScenarioSelectors.selectAreaMatrixDataLoading).subscribe(loading => {
      this.loaded = !loading;
    });
  }

  private resetState() {
    this.areaTypes = [];
    this.firstAreaOfSelectedAreaType = this.selectedAreaType = this.selectedCustomMatrix = this.defaultArea = undefined;
    this.matrixOverridden.emit(undefined);
  }

  get standardLabel() {
    return (
      !this.defaultMatrixTranslation ? '' :
      this.defaultArea?.name ? `${this.defaultMatrixTranslation} (${this.defaultArea.name})` :
      this.defaultMatrixTranslation
    );
  }

  get matrixOptions() {
    if (this.defaultArea) { // loaded?
      return [this.defaultArea.defaultMatrix, ...this.defaultArea.commonBaselineMatrices, ...this.defaultArea.userDefinedMatrices];
    }
    return [];
  }

  get commonOptionalMatrices() {
    if(this.defaultArea) {
      return [...this.defaultArea.commonBaselineMatrices];
    }
    return [];
  }

  check(value: MatrixOption, control: MatSelect | null) {
    this.matrixOption = value;

    if (this.matrixOption === 'STANDARD') {
      this.matrixOverridden.emit(undefined);
    }

    [this.altMatrixSelect, this.userMatrixSelect, this.typeMatrixSelect].forEach(
      dd => {
        if(dd && dd !== control) {
          dd.options.forEach(i => i.deselect())
        } else if (dd === control && dd.options.length === 1) {
          dd.writeValue(dd.options.first.value);
          if(dd === this.userMatrixSelect || dd === this.altMatrixSelect){
            this.customSelect(dd.options.first.value);
          }
        }
      });
  }

  hasAreaTypes = () => Boolean(this.areaTypes?.length);

  hasOptionalMatrices = () => Boolean(this.defaultArea?.commonBaselineMatrices.length) || false;

  areaTypeSelect(event: AreaTypeMatrixMapping) {
    this.selectedAreaType = event;
    this.firstAreaOfSelectedAreaType = this.selectedAreaType!.areas[0];
    this.areaTypeMatrixOptions = [this.firstAreaOfSelectedAreaType.defaultMatrix,
      ...this.firstAreaOfSelectedAreaType.matrices];
  }

  areaTypeMatrixSelect(matrix: MatrixRef) {
    this.areaTypeSelected.emit({
      defaultMatrixId: this.defaultArea!.defaultMatrix.id,
      areaTypes: [{
        id: this.selectedAreaType!.id,
        areaMatrices: this.selectedAreaType!.areas.map((area: Area) => ({
          areaId: area.id,
          matrixId: matrix.id
        }))
      }
]    });
  }

  customSelect(matrix: MatrixRef) {
    this.selectedCustomMatrix = matrix;
    this.matrixOverridden.emit(this.selectedCustomMatrix.id);
  }

  optionalSelect(matrix: MatrixRef) {
    this.matrixOverridden.emit(matrix.id);
  }

  async editMatrix() {
    const matrixId = this.selectedCustomMatrix ? this.selectedCustomMatrix.id : this.defaultArea?.defaultMatrix.id;

    this.loadingMatrix = true;
    try {
      const sensitivityMatrix = await this.matrixService.getSensitivityMatrix(matrixId as number).toPromise();
      this.loadingMatrix = false;

      const {id, name, savedAsNew, deleted} = await this.dialogService.open<SensitivityMatrix & {savedAsNew: boolean, deleted: boolean}>(MatrixTableComponent, this.moduleRef, {
        data: {
          area: this.defaultArea?.name,
          areaId: this.defaultArea?.id,
          matrixData: sensitivityMatrix,
          immutable: this.selectedCustomMatrix?.immutable || this.selectedCustomMatrix?.id === this.defaultArea?.defaultMatrix.id || false
        }
      });
      if (savedAsNew) {
        this.store.dispatch(AreaActions.addUserDefinedMatrix({ matrix: {id: id!, name, immutable: false } }));
      }
      if(deleted) {
        this.store.dispatch(ScenarioActions.fetchAreaMatrices({ geometry: this.feature.geometry }))
      }
    } catch (error) {
      this.loadingMatrix = false;
      console.error("Error fetching matrix:" +error);
    }
  }

  ngOnDestroy() {
    this.matrixDataLoadingSubcription.unsubscribe();
    this.matrixDataSubcription.unsubscribe();
  }
}
