import { Component, Input } from '@angular/core';
import { formatNumber } from '@angular/common';
import { TranslateService } from "@ngx-translate/core";
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

  constructor(private translate : TranslateService) {}

  type = NormalizationType; // make enum available to template

  get areaKm2() {
    return this.area ? this.area / 1e6 : 0;
  }

  typeOf = (obj: any) => typeof obj;
  hasAreaTypes = (matrix: any) => typeof matrix === 'object' &&  Object.keys(matrix.areaTypes).length;

  /* Assumes two reports */
  relativeDifferencePercentage(prop: string) {
    const pkey = prop as keyof Report,
          a = this.reports ? this.reports[0][pkey] as number : 0,
          b = this.reports ? this.reports[1][pkey] as number : 0,
          result = ((b - a) / a);

    return (isNaN(result)) ?
          this.translate.instant('report.cumulative-effect-etc.not-measurable') :
          formatNumber(result * 100, this.locale, '1.0-2') + "%";
  }
}
