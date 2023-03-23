import { Component, Input } from '@angular/core';
import { Report } from "@data/calculation/calculation.interfaces";

@Component({
  selector: 'app-histogram',
  templateUrl: './histogram.component.html',
  styleUrls: ['./histogram.component.scss']
})

export class HistogramComponent  {
  @Input() title?: string;
  @Input() report!: Report;
  @Input() locale = 'en';
}
