import { Component } from '@angular/core';
import { Store } from "@ngrx/store";
import { State } from "@src/app/app-reducer";
import { DialogRef } from "@shared/dialog/dialog-ref";
import { DialogConfig } from "@shared/dialog/dialog-config";

@Component({
  selector: 'app-delete-calculation-confirmation-dialog',
  templateUrl: './delete-calculation-confirmation-dialog.component.html',
  styleUrls: ['./delete-calculation-confirmation-dialog.component.scss']
})
export class DeleteCalculationConfirmationDialogComponent {

  public calculationName: string;

  constructor(private store: Store<State>,
              private dialog: DialogRef,
              private config: DialogConfig) {
    this.calculationName = config.data.calculationName;
  }

  confirm = () => {
    this.dialog.close(true);
  }

  close = () => {
    this.dialog.close(false);
  }
}
