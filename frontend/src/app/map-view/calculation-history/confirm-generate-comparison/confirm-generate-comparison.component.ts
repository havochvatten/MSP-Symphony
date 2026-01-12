import { Component, inject } from '@angular/core';
import { DialogRef } from '@src/app/shared/dialog/dialog-ref';

@Component({
  selector: 'app-confirm-generate-comparison',
  templateUrl: './confirm-generate-comparison.component.html',
  styleUrls: ['./confirm-generate-comparison.component.scss'],
  standalone: false
})
export class ConfirmGenerateComparisonComponent {
  private dialog = inject(DialogRef);


  cmpName = '';

  close = () => {
    this.dialog.close();
  }

  calculate = () => {
    this.dialog.close(this.cmpName);
  }
}
