import { Component } from '@angular/core';
import { DialogRef } from "@shared/dialog/dialog-ref";
import buildInfo from '@src/build-info';
import attributions from 'attributions';

@Component({
  selector: 'app-about-dialog-component',
  templateUrl: './about-dialog.component.html',
  styleUrls: ['./about-dialog.component.scss']
})
export class AboutDialogComponent {
  protected buildInfo = buildInfo; // make available to template
  protected thirdPartyLibraries: string[][] = attributions;

  constructor(private dialog: DialogRef) {}

  close() {
    this.dialog.close();
  }
}
