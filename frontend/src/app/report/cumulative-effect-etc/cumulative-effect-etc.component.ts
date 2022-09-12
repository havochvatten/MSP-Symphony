import { Component, Input } from '@angular/core';
import { NormalizationOptions, NormalizationType } from "@data/calculation/calculation.service";
import { Report } from "@data/calculation/calculation.interfaces";

@Component({
  selector: 'app-cumulative-effect-etc',
  templateUrl: './cumulative-effect-etc.component.html',
  styleUrls: ['./cumulative-effect-etc.component.scss']
})
export class CumulativeEffectEtcComponent {
  @Input() reports?: Report[];
  @Input() area?: number;
  @Input() footnote?: string;
  @Input() normalization?: NormalizationOptions;
  @Input() locale = 'en';

  type = NormalizationType; // make enum available to template

  get areaKm2() {
    return this.area ? this.area / 1e6 : 0;
  }

  typeOf = (obj: any) => typeof obj;
  hasAreaTypes = (matrix: any) => typeof matrix === 'object' &&  Object.keys(matrix.areaTypes).length;
  relativeDifferencePercentage(prop: string) {
    const pkey = prop as keyof Report;
    return this.reports && this.reports.length === 2 && (this.reports[0][pkey] as number) > 0 ?
        ((this.reports[1][pkey] as number) /
         (this.reports[0][pkey] as number)) * 100 :
      0;
  }
}
