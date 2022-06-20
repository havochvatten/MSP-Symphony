import { Component, Input, OnChanges } from '@angular/core';
import { BandGroup, Band } from '@data/metadata/metadata.interfaces';
import { colors } from '@src/app/shared/pressure-color-scale/pressure-color-scale.component';

@Component({
  selector: 'app-highest-impacts',
  templateUrl: './highest-impacts.component.html',
  styleUrls: ['./highest-impacts.component.scss']
})
export class HighestImpactsComponent implements OnChanges {
  @Input() title?: string;
  @Input() bandGroups?: BandGroup[];
  @Input() impacts: Record<number, number> = {};
  @Input() total: number = 0;
  @Input() locale = 'en';

  highestImpacts: Band[] = [];

  ngOnChanges() {
    if (this.bandGroups) {
      this.highestImpacts = this.bandGroups
        .reduce((bands: Band[], group: BandGroup) => [...bands, ...group.properties], [])
        .sort((a, b) => this.compareImpact(a.bandNumber, b.bandNumber))
        .slice(0, 5)
        .filter(band => this.getImpact(band.bandNumber) > 0);
    }
  }

  compareImpact(bandNumberA: number, bandNumberB: number) {
    return this.getImpact(bandNumberB) - this.getImpact(bandNumberA);
  }

  getImpact(bandNumber?: number): number {
    if (bandNumber !== undefined && this.total
      && Object.keys(this.impacts).includes(String(bandNumber)))
      return 100*this.impacts[bandNumber]/this.total;
    else
      return 0;
  }

  getColor(impact: number) {
    for (const pressure of colors) {
      if (impact < pressure.max) {
        return pressure.color;
      }
    }
    return 'black';
  }

  bar(x: number, y: number, w: number, h: number, r: number, f: number = 1) {
    // f -> Flag for sweep
    // x coordinates of top of arcs
    const x0 = x + r;
    const x1 = x + w - r;
    // y coordinates of bottom of arcs
    const y0 = y - h + r;

    // assemble path:
    // prettier-ignore
    const parts = [
      'M', x, y, // step 1
      'L', x, y0, // step 2
      'A', r, r, 0, 0, f, x0, y - h, // step 3
      'L', x1, y - h, // step 4
      'A', r, r, 0, 0, f, x + w, y0, // step 5
      'L', x + w, y, // step 6
      'Z' // step 7
    ];
    return parts.join(' ');
  }
}
