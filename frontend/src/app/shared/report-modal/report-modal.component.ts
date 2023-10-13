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
  @ViewChild('frame') iframe?: ElementRef<HTMLIFrameElement>;

  protected constructor(private dialog: DialogRef,
                        private dom: DomSanitizer,
                        private url: string,
                        pfx: string,
                        titleKey: string) {
    this.safeUrl = this.dom.bypassSecurityTrustResourceUrl(this.url);
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
    window.open(this.url, '_blank');
  }

  downloadGeotiff() {
    document.location.href = this.apiUrl + '/geotiff';
  }

  downloadCSV() {
    document.location.href = this.apiUrl + '/csv';
  }
}
