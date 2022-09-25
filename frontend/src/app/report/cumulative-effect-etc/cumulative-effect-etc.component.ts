import { Component, Input } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { NormalizationOptions, NormalizationType } from "@data/calculation/calculation.service";
import { Report } from "@data/calculation/calculation.interfaces";
import { relativeDifference, formatPercentage } from "@data/calculation/calculation.util";

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

  constructor( private translate : TranslateService) {}

  type = NormalizationType; // make enum available to template

  get areaKm2() {
    return this.area ? this.area / 1e6 : 0;
  }

  typeOf = (obj: any) => typeof obj;
  hasAreaTypes = (matrix: any) => typeof matrix === 'object' &&  Object.keys(matrix.areaTypes).length;

  /* Assumes two reports exist */
  relativeDifferencePercentage(prop: string) {
    const pkey = prop as keyof Report;
    return formatPercentage(
      this.reports ? relativeDifference(this.reports[0][pkey], this.reports[1][pkey]) : NaN,
      2, this.locale, this.translate.instant('report.common.not-measurable'), true);
  }
}
