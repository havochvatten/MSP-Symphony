import { Component } from '@angular/core';
import { DialogRef } from '@src/app/shared/dialog/dialog-ref';

@Component({
  selector: 'app-confirm-generate-comparison',
  templateUrl: './confirm-generate-comparison.component.html',
  styleUrls: ['./confirm-generate-comparison.component.scss']
})
export class ConfirmGenerateComparisonComponent {

  cmpName = '';

  constructor(private dialog: DialogRef) {}

  close = () => {
    this.dialog.close();
  }

  calculate = () => {
    this.dialog.close(this.cmpName);
  }
}
