import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { Observable } from "rxjs";
import { Store } from "@ngrx/store";
import { ComparisonLegendState } from "@data/calculation/calculation.interfaces";
import { CalculationSelectors } from "@data/calculation";
import { State } from "@src/app/app-reducer";

@Component({
  selector: 'app-comparison-color-scale',
  templateUrl: './comparison-color-scale.component.html',
  styleUrls: ['./comparison-color-scale.component.scss']
})
export class ComparisonColorScaleComponent {

  @Input() locale = 'en';
  @Input() legends!: ComparisonLegendState[];

}
