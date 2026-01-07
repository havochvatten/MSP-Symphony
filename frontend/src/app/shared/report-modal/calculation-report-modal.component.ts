import { Component, inject } from '@angular/core';
import { ReportModalComponent } from "@shared/report-modal/report-modal.component";
import { DialogConfig } from '../dialog/dialog-config';

@Component({
  selector: 'app-calculation-report-modal',
  templateUrl: './report-modal.component.html',
  styleUrls: ['./report-modal.component.scss'],
  standalone: false
})
export class CalculationReportModalComponent extends ReportModalComponent {

  constructor() {
    const config = inject(DialogConfig);

    super(window.location.origin+'/report/'+ config.data.id,
      `/report/${config.data.id}`,'report.calculation.title');
  }
}
