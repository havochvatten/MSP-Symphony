import { Component, inject } from '@angular/core';
import { DialogRef } from "@shared/dialog/dialog-ref";
import buildInfo from '@src/build-info';
import attributions from 'attributions';

@Component({
  selector: 'app-about-dialog-component',
  templateUrl: './about-dialog.component.html',
  styleUrls: ['./about-dialog.component.scss'],
  standalone: false
})
export class AboutDialogComponent {
  private readonly dialog = inject(DialogRef);

  protected buildInfo = buildInfo; // make available to template
  protected thirdPartyLibraries: string[][] = attributions;

  close() {
    this.dialog.close();
  }
}
