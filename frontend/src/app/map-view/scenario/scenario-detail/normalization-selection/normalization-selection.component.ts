import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NormalizationOptions, NormalizationType } from "@data/calculation/calculation.service";

// TODO move to environment?
export const DEFAULT_OPTIONS: NormalizationOptions = {
  type: NormalizationType.Domain
}

@Component({
  selector: 'app-normalization-selection',
  templateUrl: './normalization-selection.component.html',
  styleUrls: ['./normalization-selection.component.scss']
})
export class NormalizationSelectionComponent {
  @Input() options: NormalizationOptions = DEFAULT_OPTIONS;
  @Output() modeSelectionEvent = new EventEmitter<NormalizationOptions>();

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

  showUserDefinedValueField = () => this.options.type == NormalizationType.UserDefined;

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
}
