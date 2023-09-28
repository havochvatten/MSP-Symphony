import { Component, Input } from '@angular/core';
import { ComparisonLegendState } from "@data/calculation/calculation.interfaces";

@Component({
  selector: 'app-comparison-color-scale',
  templateUrl: './comparison-color-scale.component.html',
  styleUrls: ['./comparison-color-scale.component.scss']
})
export class ComparisonColorScaleComponent {

  @Input() locale = 'en';
  @Input() legends!: ComparisonLegendState[];

}
