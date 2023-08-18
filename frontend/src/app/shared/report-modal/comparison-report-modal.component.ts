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
    const location = window.location.origin + '/report/' +
      (config.data.dynamicMax ? 'compareDynamic' : 'compare') + '/' +
      config.data.a + '/' + config.data.b +
      (config.data.dynamicMax ? '/' + config.data.dynamicMax : '');

    super(dialog, dom, location,
      `/report/comparison/${config.data.a}/${config.data.b}`,
      'report.comparison.title');
  }
}
