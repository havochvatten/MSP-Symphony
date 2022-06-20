import { Component } from '@angular/core';
import { DialogRef } from '@shared/dialog/dialog-ref';
import { DialogConfig } from '@shared/dialog/dialog-config';
import { SensitivityMatrix } from '@src/app/map-view/scenario/scenario-detail/matrix-selection/matrix.interfaces';
import { MatrixService } from '../matrix.service';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

interface NamedObject {
  name: string;
  nameLocal: string;
}

@Component({
  selector: 'app-matrix-table',
  templateUrl: './matrix-table.component.html',
  styleUrls: ['./matrix-table.component.scss']
})
export class MatrixTableComponent {
  area: string;
  areaId: number;
  immutable: boolean; // default matrices are read-only
  matrixData: SensitivityMatrix;
  initialName: string;
  hasChangedName = false;
  editName = false;
  locale = 'en';

  constructor(
    private dialog: DialogRef,
    private config: DialogConfig,
    private matrixService: MatrixService,
    private translateService: TranslateService
  ) {
    this.area = this.config.data.area;
    this.areaId = this.config.data.areaId;
    this.matrixData = this.config.data.matrixData;
    this.immutable = this.config.data.immutable;
    this.locale = this.translateService.currentLang;
    this.initialName = this.matrixData.name;
  }

  onChange(value: number, row: number, column: number) {
    this.matrixData.sensMatrix.rows[row].columns[column].value = value;
  }

  onChangeName(name: string) {
    this.matrixData.name = name;
    this.hasChangedName = name.trim() !== this.initialName;
  }

  async saveAsNew() {
    this.matrixService
      .createSensitivityMatrixForArea(this.areaId, this.matrixData)
      .pipe(
        tap(response => {
          this.dialog.close({...response, savedAsNew: true});
        }),
        catchError(error => of(console.error(error)))
      )
      .subscribe();
  }

  save() {
    this.matrixService
      .updateSensitivityMatrix(this.matrixData.id as number, this.matrixData)
      .pipe(
        tap(response => {
          this.dialog.close({...response, savedAsNew: false});
        }),
        catchError(error => of(console.error(error)))
      )
      .subscribe();
  }

  deleteMatrix() {
    this.matrixService
      .deleteSensitivityMatrix(this.matrixData.id as number)
      .pipe(
        tap(() => {
          this.dialog.close();
        }),
        catchError(error => of(console.error(error)))
      )
      .subscribe();
  }

  close() {
    this.dialog.close({id: this.matrixData.id, name: this.initialName, savedAsNew: false});
  }

  getName(object: NamedObject) {
    return this.locale === 'sv' ? object.nameLocal : object.name;
  }
}
