import { Component, Input } from '@angular/core';
import { VisibleUncertainty } from "@data/metadata/metadata.interfaces";

@Component({
  selector: 'app-uncertainty-legend',
  templateUrl: './uncertainty-legend.component.html',
  styleUrl: './uncertainty-legend.component.scss'
})
export class UncertaintyLegendComponent {
  @Input() uncertainty: VisibleUncertainty | null = null;
}
