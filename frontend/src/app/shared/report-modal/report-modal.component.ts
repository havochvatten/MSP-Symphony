import { ElementRef, ViewChild, Directive } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DialogRef } from '../dialog/dialog-ref';

@Directive()
export class ReportModalComponent {
  safeUrl: SafeResourceUrl;
  @ViewChild('frame') iframe?: ElementRef<HTMLIFrameElement>;

  constructor(
    private dialog: DialogRef,
    private dom: DomSanitizer,
    private url: string
  ) {
    this.safeUrl = this.dom.bypassSecurityTrustResourceUrl(this.url);
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
}
