import { Component, Input } from '@angular/core';
import { BandGroup } from '@data/metadata/metadata.interfaces';
import { formatPercentage } from '@src/app/shared/common.util';

@Component({
  selector: 'app-impact-table',
  templateUrl: './impact-table.component.html',
  styleUrls: ['./impact-table.component.scss']
})
export class ImpactTableComponent {
  @Input() title?: string;
  @Input() bandGroups?: BandGroup[];
  @Input() scenarioImpacts: Record<string, number>[] = [];
  @Input() names: string[] = [];
  @Input() locale = 'en';

  isExcluded(bandNumber: number): boolean {
    return this.scenarioImpacts.every(impacts => !(bandNumber in impacts));
  }

  formatPercentage(value: number, ersatz: string, relative: boolean) {
    return isNaN(value) ? "" : formatPercentage(value / (this.isComparative() ? 1 : 100), 2, this.locale, ersatz, relative);
  }

  isComparative(): boolean {
    return this.scenarioImpacts.length > 2;
  }
}
