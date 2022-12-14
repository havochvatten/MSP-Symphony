import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { DialogRef } from '../dialog/dialog-ref';
import { DialogConfig } from '../dialog/dialog-config';
import { ReportModalComponent } from "@shared/report-modal/report-modal.component";
import { environment as env } from "@src/environments/environment";

@Component({
  selector: 'app-comparison-report-modal',
  templateUrl: './comparison-report-modal.component.html',
  styleUrls: ['./report-modal.component.scss']
})
export class ComparisonReportModalComponent extends ReportModalComponent {
  private readonly a: string;
  private readonly b: string;

  constructor(
    dialog: DialogRef,
    config: DialogConfig,
    dom: DomSanitizer
  ) {
    const a = config.data.a, b = config.data.b;
    super(dialog, dom, window.location.origin+`/report/compare/${a}/${b}`);
    this.a = a, this.b = b;
  }

  downloadGeotiff() {
    document.location.href = `${env.apiBaseUrl}/report/comparison/${this.a}/${this.b}/geotiff`;
  }
}
