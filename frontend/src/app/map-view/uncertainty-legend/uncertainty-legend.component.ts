import { Component, Input } from '@angular/core';
import { VisibleUncertainty } from "@data/metadata/metadata.interfaces";
import { NgIf } from "@angular/common";
import { TranslateModule } from "@ngx-translate/core";

@Component({
  selector: 'app-uncertainty-legend',
  standalone: true,
  imports: [
    NgIf,
    TranslateModule
  ],
  templateUrl: './uncertainty-legend.component.html',
  styleUrl: './uncertainty-legend.component.scss'
})
export class UncertaintyLegendComponent {
  @Input() uncertainty: VisibleUncertainty | null = null;

}
