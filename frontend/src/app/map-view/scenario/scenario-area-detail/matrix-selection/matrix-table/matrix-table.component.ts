import { Component, NgModuleRef } from '@angular/core';
import { DialogRef } from '@shared/dialog/dialog-ref';
import { DialogConfig } from '@shared/dialog/dialog-config';
import { SensitivityMatrix } from '@src/app/map-view/scenario/scenario-area-detail/matrix-selection/matrix.interfaces';
import { MatrixService } from '../matrix.service';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { isEqual } from "lodash";
import { DialogService } from "@shared/dialog/dialog.service";
import { ConfirmationModalComponent } from "@shared/confirmation-modal/confirmation-modal.component";

interface NamedObject {
  name: string;
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
  matrixDataRef: number[] = [];
  initialName: string;
  matrixNames: string[];
  dirty = false;
  savedAsNewId: number|undefined;
  savedAsNewName: string|undefined;
  editName = false;
  locale = 'en';

  constructor(
    protected dialog: DialogRef,
    private config: DialogConfig,
    private dialogService: DialogService,
    private moduleRef: NgModuleRef<never>,
    private matrixService: MatrixService,
    private translateService: TranslateService
  ) {
    this.area = this.config.data.area;
    this.areaId = this.config.data.areaId;
    this.matrixData = this.config.data.matrixData;
    this.immutable = this.config.data.immutable;
    this.matrixNames = this.config.data.matrixNames;
    this.locale = this.translateService.currentLang;
    this.initialName = this.matrixData.name;
    this.initClean();
  }

  public initClean():void {
    this.dirty = false;
    this.matrixDataRef = this.matrixData.sensMatrix.rows.flatMap((r) => r.columns.map((c) => +c.value));
  }

  hasChangedName():boolean {
    return this.matrixData.name.trim() !== this.initialName;
  }

  onChange(value: number, row: number, column: number) {
    this.matrixData.sensMatrix.rows[row].columns[column].value = value;
    this.dirty = !isEqual(this.matrixData.sensMatrix.rows.flatMap((r) => r.columns.map((c) => +c.value)), this.matrixDataRef);
  }

  onChangeName(name: string) {
    this.matrixData.name = name;
  }

  async saveAsNew(then: () => void) {
    await this.matrixService
      .createSensitivityMatrixForArea(this.areaId, this.matrixData)
      .pipe(
        tap(response => {
          this.matrixData = response;
          this.savedAsNewId = response.id;
          this.savedAsNewName = response.name;
          this.initialName = response.name;
          this.immutable = false;
          then();
        }),
        catchError(error => of(console.error(error)))
      )
      .subscribe();
  }

  async save(then: () => void) {
    this.matrixService
      .updateSensitivityMatrix(this.matrixData.id as number, this.matrixData)
      .pipe(
        tap(() => {
          then();
        }),
        catchError(error => of(console.error(error)))
      )
      .subscribe();
  }

  async deleteMatrix() {
    const confirmDelete = await this.dialogService.open<boolean>(ConfirmationModalComponent, this.moduleRef, {
      data: {
        header: this.translateService.instant('map.editor.matrix.table.confirm-delete.header'),
        message: this.translateService.instant('map.editor.matrix.table.confirm-delete.message',
                                { matrixToDelete: this.initialName }),
        confirmText: this.translateService.instant('map.editor.matrix.table.confirm-delete.confirm'),
        confirmColor: 'warn',
        dialogClass: 'center'
      }
    });

    if (confirmDelete) {
      this.matrixService
        .deleteSensitivityMatrix(this.matrixData.id as number)
        .pipe(
          tap(() => {
            this.dialog.close({deleted: true});
          }),
          catchError(error => of(console.error(error)))
        )
        .subscribe();
    }
  }

  async confirmClose() {
    const cbClose = () => { this.close() }, // Wrap method in closure, preserving (this) context
          closeModal = {
            header: this.translateService.instant('map.editor.matrix.table.changes.header'),
            confirmText: this.translateService.instant('map.editor.matrix.table.changes.save'),
            cancelText: this.translateService.instant('map.editor.matrix.table.changes.abandon'),
            buttonsClass: 'right no-margin',
            cancelColor: 'warn',
            message: null,
          };

    if(this.immutable && this.dirty) {
      const mxNrRx = / (?:\((\d+)\))+$/, mxNameResult = mxNrRx.exec(this.matrixData.name);
      let i = mxNameResult ? +mxNameResult[1] : 0, nextName: string;

      do {
        nextName = `${this.matrixData.name} (${++i})`
      } while (this.nameExists(nextName))

      closeModal.message = this.translateService.instant('map.editor.matrix.table.changes.immutable-message', { suggestedName: nextName });

      const confirmSaveCopy = await this.dialogService.open<boolean>(
        ConfirmationModalComponent, this.moduleRef, { data: closeModal });

      if(confirmSaveCopy) {
        this.matrixData.name = nextName;
        await this.saveAsNew(cbClose);
        return;
      }

    } else {
      closeModal.message = this.translateService.instant('map.editor.matrix.table.changes.message',
        {
          matrixName: this.hasChangedName() && this.nameExists() ? this.initialName : this.matrixData.name,
          newNotice: this.hasChangedName() && !this.nameExists() ? ' ' + this.translateService.instant('map.editor.matrix.table.changes.new-notice') : ''
        });

      // note: inverse condition for brevity ('short-circuit' conjunction)
      const confirmAbandon = this.immutable || !(this.dirty || (!this.nameExists() && this.hasChangedName())) ||
        !(await this.dialogService.open<boolean>(
          ConfirmationModalComponent, this.moduleRef, { data: closeModal }));

      if (!confirmAbandon) {
        if (this.hasChangedName() && !this.nameExists()) {
          await this.saveAsNew(cbClose);
        } else {
          await this.save(cbClose);
        }
        return;
      }
    }

    this.close();
  }

  close() {
    this.dialog.close(
      { id: this.savedAsNewId || this.matrixData.id,
        name: this.savedAsNewName || this.initialName,
        savedAsNew: !!this.savedAsNewId });
  }

  getName(object: NamedObject) {
    return object.name;
  }

  nameExists(name:string|undefined = undefined):boolean {
    return this.matrixNames.includes(name || this.matrixData.name);
  }
}
