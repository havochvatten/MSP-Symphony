import { Component, EventEmitter, Input, NgModuleRef, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import {
  Area, AreaTypeMatrixMapping,
  MatrixRef, MatrixOption, MatrixParameters,
  SensitivityMatrix, AreaMatrixData
} from "./matrix.interfaces";
import { MatrixTableComponent } from './matrix-table/matrix-table.component';
import { DialogService } from '@shared/dialog/dialog.service';
import { Store } from '@ngrx/store';
import { State } from '@src/app/app-reducer';
import { TranslateService } from "@ngx-translate/core";
import { MatrixService } from './matrix.service';
import { MatLegacySelect as MatSelect } from "@angular/material/legacy-select";
import { Scenario } from "@data/scenario/scenario.interfaces";
import { ScenarioActions, ScenarioSelectors } from "@data/scenario";
import { Subscription } from "rxjs";

@Component({
  selector: 'app-matrix-selection',
  templateUrl: './matrix-selection.component.html',
  styleUrls: ['./matrix-selection.component.scss']
})
// TODO We would like to deserialize the matrix options from the scenario so as not to have to load them each time
// the scenario is opened. But still need to fetch matrices from server (but perhaps in background, i.e. no spinner?)
export class MatrixSelectionComponent implements OnInit, OnDestroy {
  matrixOption: MatrixOption = 'STANDARD';
  loadingMatrix = false;
  areaTypes: AreaTypeMatrixMapping[] = []; // get from input?
  selectedAreaType?: AreaTypeMatrixMapping;
  firstAreaOfSelectedAreaType?: Area;
  matrixOptions: MatrixRef[] = [];
  areaTypeMatrixOptions: MatrixRef[] = [];
  public selectedCustomMatrix?: MatrixRef;
  public selectedTypedMatrix?: MatrixRef;
  public selectedOptionalMatrix?: MatrixRef;
  @Input() scenario!: Scenario;
  @Input() areaIndex!: number;
  @Output() setMatrix = new EventEmitter<MatrixParameters>();
  @ViewChild('altMx') altMatrixSelect: MatSelect | undefined;
  @ViewChild('usrMx') userMatrixSelect: MatSelect| undefined;
  @ViewChild('typeMx') typeMatrixSelect: MatSelect | undefined;
  private defaultMatrixTranslation?: string
  private matrixData?: AreaMatrixData;
  private matrixDataSubscription$: Subscription;


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
    this.matrixDataSubscription$ = this.store.select(ScenarioSelectors.selectActiveAreaMatrixData).subscribe((matrixData: AreaMatrixData | null) => {
      if(matrixData) {
        this.matrixData = matrixData;
        if(this.matrixData && this.matrixData.defaultArea) {
          this.areaTypes = this.matrixData.areaTypes.filter(type => !type.coastalArea);
          this.matrixOptions =
            [this.matrixData.defaultArea.defaultMatrix,
            ...this.matrixData.defaultArea.commonBaselineMatrices,
            ...this.matrixData.defaultArea.userDefinedMatrices];
        }
        if(this.scenario && this.scenario.areas[this.areaIndex].matrix) { // scenario may be undefined before component initialization
          this.setSelectedCustomMatrix(this.scenario.areas[this.areaIndex].matrix.matrixId);
        }
      }
    });
  }

  ngOnInit():void {
    let matrixId;
    if(!this.scenario.areas[this.areaIndex].matrix) {
      this.matrixOption = 'STANDARD';
      this.setMatrix.emit({ matrixType: 'STANDARD', matrixId: undefined });
    } else {
      this.matrixOption = this.scenario.areas[this.areaIndex].matrix.matrixType;
      matrixId = this.scenario.areas[this.areaIndex].matrix.matrixId;
    }

    this.setSelectedCustomMatrix(matrixId);
  }

  // TODO: Utilize ngModel
  private setSelectedCustomMatrix(matrixId: number | undefined = undefined) {
    if (matrixId) {
      switch (this.matrixOption) {
        case 'STANDARD':
          const allAreaTypeMatrixOptions = this.getAllAreaTypeMatrixOptions();
          this.selectedAreaType = this.areaTypes.find(type =>
            type.areas.find(area => area.defaultMatrix?.id == matrixId || area.matrices.find(mx => mx.id === matrixId)));
          if(this.selectedAreaType) {
            this.areaTypeSelect(this.selectedAreaType);
            this.selectedTypedMatrix = allAreaTypeMatrixOptions.find(mx => mx.id === matrixId);
          }
          break;
        case 'OPTIONAL':
          this.selectedOptionalMatrix = this.commonOptionalMatrices.find(mx => mx.id === matrixId);
          break;
        case 'CUSTOM':
          this.selectedCustomMatrix = this.matrixOptions.find(mx => mx.id === matrixId);
          break;
      }
    }
  }

  private getAllAreaTypeMatrixOptions(): MatrixRef[] {
    const areaTypeMatrixOptions: MatrixRef[] = [];
    if(this.areaTypes){
      for(const areaType of this.areaTypes) {
        for (const area of areaType.areas){
          if(area.defaultMatrix &&
            !areaTypeMatrixOptions.find(m => m.id === area.defaultMatrix.id))
              areaTypeMatrixOptions.push(area.defaultMatrix);

          for(const mx of area.matrices) {
            if(!areaTypeMatrixOptions.find(m => m.id === mx.id)) {
              areaTypeMatrixOptions.push(mx);
            }
          }
        }
      }
    }
    return areaTypeMatrixOptions;
  }

  get standardLabel() {
    if(this.matrixData) {
      return (
        !this.defaultMatrixTranslation ? '' :
          this.matrixData.defaultArea?.name ? `${this.defaultMatrixTranslation} (${this.matrixData.defaultArea.name})` :
            this.defaultMatrixTranslation
      );
    }
    return '';
  }

  get commonOptionalMatrices() {
    if(this.matrixData && this.matrixData.defaultArea) {
      return [...this.matrixData.defaultArea.commonBaselineMatrices];
    }
    return [];
  }

  check(value: MatrixOption, control: MatSelect | null) {
    this.matrixOption = value;

    if (this.matrixOption === 'STANDARD') {
      this.setMatrix.emit({ matrixType: 'STANDARD', matrixId: undefined });
    }

    [this.altMatrixSelect, this.userMatrixSelect, this.typeMatrixSelect].forEach(
      dd => {
        if(dd && dd !== control) {
          dd.options.forEach(i => i.deselect())
        } else if (dd === control && dd.options.length === 1) {
          dd.writeValue(dd.options.first.value);
          this.customSelect(dd.options.first.value);
        }
      });
  }

  hasAreaTypes = () => Boolean(this.areaTypes?.length);

  hasOptionalMatrices = () =>
    (this.matrixData === null || !this.matrixData?.defaultArea) ? false :
    Boolean(this.matrixData!.defaultArea!.commonBaselineMatrices.length) || false;

  areaTypeSelect(event: AreaTypeMatrixMapping) {
    this.selectedAreaType = event;
    if(this.selectedAreaType) {
      this.firstAreaOfSelectedAreaType = this.selectedAreaType!.areas[0];
      this.areaTypeMatrixOptions = [this.firstAreaOfSelectedAreaType.defaultMatrix,
        ...this.firstAreaOfSelectedAreaType.matrices];
    } else {
      this.firstAreaOfSelectedAreaType = undefined;
      this.selectedTypedMatrix = undefined;
      this.areaTypeMatrixOptions = [];
    }
  }

  customSelect(matrix: MatrixRef) {
    this.setSelectedCustomMatrix(matrix.id);
    this.setMatrix.emit({ matrixType: this.matrixOption, matrixId: matrix.id });
  }

  async editMatrix() {
    const matrixId = this.selectedCustomMatrix ? this.selectedCustomMatrix.id : this.matrixData!.defaultArea?.defaultMatrix.id;

    this.loadingMatrix = true;
    try {
      const sensitivityMatrix = await this.matrixService.getSensitivityMatrix(matrixId as number).toPromise();
      this.loadingMatrix = false;

      const { savedAsNew, deleted } = await this.dialogService.open<SensitivityMatrix & {savedAsNew: boolean, deleted: boolean}>(MatrixTableComponent, this.moduleRef, {
        data: {
          area: this.matrixData!.defaultArea?.name,
          areaId: this.matrixData!.defaultArea?.id,
          matrixData: sensitivityMatrix,
          immutable: this.selectedCustomMatrix?.immutable || this.selectedCustomMatrix?.id === this.matrixData!.defaultArea?.defaultMatrix.id || false,
          matrixNames: this.matrixOptions.map((m) => m.name)
        }
      });
      if(savedAsNew || deleted) {
        this.store.dispatch(ScenarioActions.fetchAreaMatrices({ scenarioId: this.scenario.id }));
      }
    } catch (error) {
      this.loadingMatrix = false;
      console.error("Error fetching matrix:" +error);
    }
  }

  ngOnDestroy(): void {
    this.matrixDataSubscription$.unsubscribe();
  }
}
