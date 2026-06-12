import { ElementRef, ViewChild, Directive, OnDestroy, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DialogRef } from '../dialog/dialog-ref';
import { environment as env } from "@src/environments/environment";
import * as d3 from "d3";

@Directive({ standalone: false })
export abstract class ReportModalComponent implements OnDestroy {
  safeUrl: SafeResourceUrl;
  apiUrl: string;
  titleKey: string;
  param_annex: string;
  @ViewChild('frame') iframe?: ElementRef<HTMLIFrameElement>;

  private readonly dialog = inject(DialogRef);
  private readonly dom = inject(DomSanitizer);
  private readonly url: string;

  protected constructor(url: string,
                        pfx: string,
                        titleKey: string,
                        annex?: string) {
    this.url = url;
    this.param_annex = annex || '';
    this.safeUrl = this.dom.bypassSecurityTrustResourceUrl(url + this.param_annex);
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
