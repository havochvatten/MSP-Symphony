import { Component } from '@angular/core';
import { DialogRef } from "@shared/dialog/dialog-ref";
import { DialogConfig } from "@shared/dialog/dialog-config";
import { DownloadCompoundComparisonOptions } from '@data/calculation/calculation.interfaces';
import { MatRadioChange } from "@angular/material/radio";

@Component({
  selector: 'app-download-compound-comparison-dialog',
  templateUrl: './download-compound-comparison-dialog.component.html',
  styleUrls: ['./download-compound-comparison-dialog.component.scss']
})
export class DownloadCompoundComparisonDialogComponent {

  comparisonName = '';
  downloadOptions: DownloadCompoundComparisonOptions = {
    asJson: true,
    includeUnchanged: true,
    includeCombined: false
  };

  constructor(private dialog: DialogRef,
              private config: DialogConfig) {
    this.comparisonName = this.config.data.comparisonName;
  }

  close = () => {
    this.dialog.close(null);
  }

  download = () => {
    this.dialog.close(this.downloadOptions);
  }

  setFormat(changeEvent: MatRadioChange) {
    this.downloadOptions.asJson = changeEvent.value === 'json';
    if (this.downloadOptions.asJson) {
      this.downloadOptions.includeCombined = false;
    }
  }
}
