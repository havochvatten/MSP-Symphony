import { Component, OnInit } from '@angular/core';
import { DialogRef } from '@src/app/shared/dialog/dialog-ref';
import { DialogConfig } from '@src/app/shared/dialog/dialog-config';

@Component({
  selector: 'app-delete-scenario-confirmation-dialog',
  templateUrl: './delete-scenario-confirmation-dialog.component.html',
  styleUrls: ['./delete-scenario-confirmation-dialog.component.scss']
})
export class DeleteScenarioConfirmationDialogComponent {
  name: string;

  constructor(private dialog: DialogRef,
              private config: DialogConfig) {
    this.name = this.config.data.name;
  }

  delete() {
    this.dialog.close(true);
  }

  cancel = () => {
    this.dialog.close(false);
  };
}
