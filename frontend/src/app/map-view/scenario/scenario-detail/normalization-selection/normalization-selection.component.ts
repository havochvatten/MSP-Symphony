import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { NormalizationOptions, NormalizationType } from "@data/calculation/calculation.service";
import { TranslateService } from "@ngx-translate/core";
import { environment } from "@src/environments/environment";

export const DEFAULT_OPTIONS: NormalizationOptions = {
  type: environment.editor.defaultNormalizationType as NormalizationType,
  stdDevMultiplier: 0,
  userDefinedValue: 1
}

@Component({
  selector: 'app-normalization-selection',
  templateUrl: './normalization-selection.component.html',
  styleUrls: ['./normalization-selection.component.scss']
})
export class NormalizationSelectionComponent implements OnChanges {
  @Input() options: NormalizationOptions = DEFAULT_OPTIONS;
  @Input() algorithm = '';
  @Input() percentileValue = 0;
  @Output() modeSelectionEvent = new EventEmitter<NormalizationOptions>();
  readonly NormalizationType = NormalizationType;
  locale = 'en';

  constructor(private translateService: TranslateService) {
    this.locale = this.translateService.currentLang;
  }

  radioButtons = [
    {
      label: 'map.editor.normalization.domain',
      value: NormalizationType.Domain
    },
    {
      label: 'map.editor.normalization.area',
      value: NormalizationType.Area
    },
    {
      label: 'map.editor.normalization.mean-plus-stddev',
      value: NormalizationType.StandardDeviation
    },
    {
      label: 'map.editor.normalization.custom',
      value: NormalizationType.UserDefined
    }
  ];

  showValueField(ntype :  NormalizationType): boolean {
    return ntype === this.options.type;
  }

  check(target: NormalizationType) {
    this.modeSelectionEvent.emit({
      type: target,
      userDefinedValue: this.options.userDefinedValue,
      stdDevMultiplier: this.options.stdDevMultiplier
    });
  }

  onChangeValue(ntype: NormalizationType, event: Event) {
    const opts = this.options,
          val = parseFloat((event.target! as HTMLInputElement).value);

    this.modeSelectionEvent.emit({
      type: ntype,
      userDefinedValue: ntype === NormalizationType.UserDefined ?
                        val : opts.userDefinedValue,
      stdDevMultiplier: ntype === NormalizationType.StandardDeviation ?
                        val : opts.stdDevMultiplier,
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.algorithm?.currentValue === 'RarityAdjustedCumulativeImpact' &&
      this.options.type === NormalizationType.Domain) {
      this.modeSelectionEvent.emit({
        type: NormalizationType.Area,
        userDefinedValue: this.options.userDefinedValue,
        stdDevMultiplier: this.options.stdDevMultiplier
      });
    }
  }
}
