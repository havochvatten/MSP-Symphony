import { ElementRef, ViewChild, Directive, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DialogRef } from '../dialog/dialog-ref';
import { environment as env } from "@src/environments/environment";
import * as d3 from "d3";

@Directive()
export abstract class ReportModalComponent implements OnDestroy {
  safeUrl: SafeResourceUrl;
  apiUrl: string;
  titleKey: string;
  param_annex: string;
  @ViewChild('frame') iframe?: ElementRef<HTMLIFrameElement>;

  protected constructor(private dialog: DialogRef,
                        private dom: DomSanitizer,
                        private url: string,
                        pfx: string,
                        param: URLSearchParams | null,
                        titleKey: string) {
    this.param_annex =  param ? [...param].length > 0 ? '?' + param.toString() : '' : '';
    this.safeUrl = this.dom.bypassSecurityTrustResourceUrl(this.url + this.param_annex);
    this.apiUrl = env.apiBaseUrl + pfx;
    this.titleKey = titleKey;
  }

  ngOnDestroy(): void {
    // clean up d3 chart object refs that will otherwise linger in the DOM
    d3.select('app-pressure-chart svg').selectAll('*').remove();
  }

  getSafeUrl() {
    return this.safeUrl;
  }

  close = () => {
    this.dialog.close();
  };

  print() {
    this.iframe?.nativeElement.contentWindow?.print();
  }

  open() {
    window.open(this.url + this.param_annex, '_blank');
  }

  downloadGeotiff() {
    document.location.href = `${this.apiUrl}/geotiff${this.param_annex}`;
  }

  downloadCSV() {
    document.location.href = `${this.apiUrl}/csv${this.param_annex}`;
  }
}
