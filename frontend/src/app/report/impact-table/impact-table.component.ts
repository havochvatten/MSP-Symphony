import { Component, Input } from '@angular/core';
import { BandGroup } from '@data/metadata/metadata.interfaces';

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
}
