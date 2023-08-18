import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { NormalizationOptions, NormalizationType } from "@data/calculation/calculation.service";
import { Report } from "@data/calculation/calculation.interfaces";
import { relativeDifference } from "@src/app/report/report.util";
import { formatPercentage } from "@src/app/shared/common.util";

@Component({
  selector: 'app-cumulative-effect-etc',
  templateUrl: './cumulative-effect-etc.component.html',
  styleUrls: ['./cumulative-effect-etc.component.scss']
})
export class CumulativeEffectEtcComponent implements OnInit {
  @Input() reports?: Report[];
  @Input() area?: number;
  @Input() normalized = false;
  @Input() normalization?: NormalizationOptions;
  @Input() percentileValue = 0;
  @Input() locale = 'en';

  jsMath = Math; // make Math available to template
  type = NormalizationType; // make enum available to template
  validArea: boolean;

  constructor(private translate : TranslateService) { this.validArea = false; }

  get areaKm2() {
    return this.area ? this.area / 1e6 : 0;
  }

  /* Assumes two reports exist */
  relativeDifferencePercentage(prop: string) {
    const pkey = prop as keyof Report;
    return formatPercentage(
      this.reports ? relativeDifference(this.reports[0][pkey], this.reports[1][pkey]) : NaN,
      2, this.locale, this.translate.instant('report.common.not-measurable'), true);
  }

  ngOnInit(): void {
    this.validArea = !isNaN(this.area!);
  }
}
