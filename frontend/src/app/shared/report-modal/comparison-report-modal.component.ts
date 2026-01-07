import { Component, inject } from '@angular/core';
import { DialogConfig } from '../dialog/dialog-config';
import { ReportModalComponent } from "@shared/report-modal/report-modal.component";

@Component({
  selector: 'app-comparison-report-modal',
  templateUrl: './report-modal.component.html',
  styleUrls: ['./report-modal.component.scss'],
  standalone: false
})
export class ComparisonReportModalComponent extends ReportModalComponent {

  constructor() {
    const config = inject(DialogConfig);

    const locationPS =
      (config.data.a === null ?
        `${config.data.b}` : `${config.data.a}/${config.data.b}`)

    super(window.location.origin + `/report/compare/${locationPS}/${config.data.max}`,
      `/report/comparison/${locationPS}`,
      'report.comparison.title',
      config.data.reverse ? new URLSearchParams([['reverse', 'true']]).toString() : undefined);
  }
}
