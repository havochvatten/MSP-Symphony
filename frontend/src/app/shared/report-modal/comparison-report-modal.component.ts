import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { DialogRef } from '../dialog/dialog-ref';
import { DialogConfig } from '../dialog/dialog-config';
import { ReportModalComponent } from "@shared/report-modal/report-modal.component";

@Component({
  selector: 'app-comparison-report-modal',
  templateUrl: './report-modal.component.html',
  styleUrls: ['./report-modal.component.scss']
})
export class ComparisonReportModalComponent extends ReportModalComponent {

  constructor(
    dialog: DialogRef,
    config: DialogConfig,
    dom: DomSanitizer
  ) {
    super(dialog, dom,
      window.location.origin+`/report/compare/${config.data.a}/${config.data.b}`,
      `/report/comparison/${config.data.a}/${config.data.b}`,
      'report.comparison.title');
  }
}
