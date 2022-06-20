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
  buildInfo = buildInfo; // make available to template
  thirdPartyLibraries: string[][] = attributions;

  constructor(private dialog: DialogRef) {}

  close = () => {
    this.dialog.close();
  };
}
