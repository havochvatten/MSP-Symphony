import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { DialogRef } from '../dialog/dialog-ref';
import { DialogConfig } from '../dialog/dialog-config';
import { environment as env } from "@src/environments/environment";
import { ReportModalComponent } from "@shared/report-modal/report-modal.component";

@Component({
  selector: 'app-calculation-report-modal',
  templateUrl: './calculation-report-modal.component.html',
  styleUrls: ['./report-modal.component.scss']
})
export class CalculationReportModalComponent extends ReportModalComponent {
  private readonly id: string;

  constructor(
    dialog: DialogRef,
    config: DialogConfig,
    dom: DomSanitizer
  ) {
    const id = config.data.id
    super(dialog, dom, window.location.origin+'/report/'+id);
    this.id = id;
  }

  downloadGeotiff() {
    document.location.href = `${env.apiBaseUrl}/report/${this.id}/geotiff`;
  }

  downloadCSV() {
    document.location.href = `${env.apiBaseUrl}/report/${this.id}/csv`;
  }
}
