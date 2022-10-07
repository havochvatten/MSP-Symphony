import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { NormalizationOptions, NormalizationType } from "@data/calculation/calculation.service";

export const DEFAULT_OPTIONS: NormalizationOptions = {
  type: NormalizationType.Area
}

@Component({
  selector: 'app-normalization-selection',
  templateUrl: './normalization-selection.component.html',
  styleUrls: ['./normalization-selection.component.scss']
})
export class NormalizationSelectionComponent implements OnChanges {
  @Input() options: NormalizationOptions = DEFAULT_OPTIONS;
  @Input() algorithm = '';

  @Output() modeSelectionEvent = new EventEmitter<NormalizationOptions>();
  readonly NormalizationType = NormalizationType;

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
      label: 'map.editor.normalization.custom',
      value: NormalizationType.UserDefined
    }
  ];

  showUserDefinedValueField = () => this.options.type === NormalizationType.UserDefined;

  check(target: NormalizationType) {
    this.modeSelectionEvent.emit({
      type: target,
      userDefinedValue: this.options.userDefinedValue
    });
  }

  onChangeUserDefinedValue(value: any) {
    this.modeSelectionEvent.emit({
      type: this.options.type,
      userDefinedValue: value
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.algorithm?.currentValue === 'RarityAdjustedCumulativeImpact' &&
      this.options.type === NormalizationType.Domain) {
      this.modeSelectionEvent.emit({
        type: NormalizationType.Area,
        userDefinedValue: this.options.userDefinedValue
      });
    }
  }
}
