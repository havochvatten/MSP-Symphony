import { Component, Input } from '@angular/core';
import { VisibleReliability } from "@data/metadata/metadata.interfaces";

@Component({
  selector: 'app-reliability-legend',
  templateUrl: './reliability-legend.component.html',
  styleUrl: './reliability-legend.component.scss'
})
export class ReliabilityLegendComponent {
  @Input() reliability: VisibleReliability | null = null;

  get bandTypeLabel(): string {
    return this.reliability?.band.symphonyCategory === 'ECOSYSTEM' ?
              'map.metadata.ecosystem' : 'map.metadata.pressure';
  }
}
