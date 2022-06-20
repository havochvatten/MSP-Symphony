import { Component, OnInit } from '@angular/core';
import { DialogRef } from '@src/app/shared/dialog/dialog-ref';
import { DialogConfig } from '@src/app/shared/dialog/dialog-config';

@Component({
  selector: 'app-delete-user-area-confirmation-dialog',
  templateUrl: './delete-user-area-confirmation-dialog.component.html',
  styleUrls: ['./delete-user-area-confirmation-dialog.component.scss']
})
export class DeleteUserAreaConfirmationDialogComponent {
  areaName: string;

  constructor(private dialog: DialogRef, private config: DialogConfig) {
    this.areaName = this.config.data.areaName;
  }

  delete() {
    this.dialog.close(true);
  }

  cancel = () => {
    this.dialog.close(false);
  };
}
