import { Component, Input } from '@angular/core';
import { BandGroup } from '@data/metadata/metadata.interfaces';
import { formatRelativePercentage } from "@data/calculation/calculation.util";

@Component({
  selector: 'app-impact-table',
  templateUrl: './impact-table.component.html',
  styleUrls: ['./impact-table.component.scss']
})
export class ImpactTableComponent {
  @Input() title?: string;
  @Input() bandGroups?: BandGroup[];
  @Input() scenarioImpacts: Record<number, number>[] = [];
  @Input() names: string[] = [];
  @Input() locale = 'en';

  isExcluded(bandNumber: number): boolean {
    return this.scenarioImpacts.every(impacts => !(bandNumber in impacts));
  }

  relativeDifferencePercentage(value: number, ersatz: string) {
    return isNaN(value) ? "" : formatRelativePercentage(value, 2, this.locale, ersatz);
  }
}
