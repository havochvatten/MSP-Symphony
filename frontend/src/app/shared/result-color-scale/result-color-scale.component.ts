import { Component, Input } from '@angular/core';
import { LegendColor } from '@data/calculation/calculation.interfaces';

@Component({
  selector: 'app-result-color-scale',
  templateUrl: './result-color-scale.component.html',
  styleUrls: ['./result-color-scale.component.scss'],
  standalone: false
})
export class ResultColorScaleComponent {
  @Input() locale = 'en';
  @Input() title?: string;
  @Input() unit = '%';
  @Input() perMille = false;
  @Input() decimals = true;

  digitsInfo(): string {
    return this.decimals ? '1.0-2' : '1.0-0';
  }

  @Input() colors?: LegendColor[];
}
