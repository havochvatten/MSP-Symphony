import { Component } from '@angular/core';
import { DialogRef } from "@shared/dialog/dialog-ref";
import { TranslateService } from "@ngx-translate/core";
import buildInfo from '@src/build-info';
import attributions from 'attributions';

@Component({
  selector: 'app-about-dialog-component',
  templateUrl: './about-dialog.component.html',
  styleUrls: ['./about-dialog.component.scss']
})
export class AboutDialogComponent {
  buildInfo = buildInfo; // make available to template
  thirdPartyLibraries: string[][] = attributions;

  constructor(private dialog: DialogRef, private translate: TranslateService) {}

  swedish_locale() {
    return this.translate.currentLang === 'sv';
  }

  close = () => {
    this.dialog.close();
  };
}
