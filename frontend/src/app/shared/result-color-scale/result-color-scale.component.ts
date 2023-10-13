import { Component, Input } from '@angular/core';
import { LegendColor } from '@data/calculation/calculation.interfaces';

@Component({
  selector: 'app-result-color-scale',
  templateUrl: './result-color-scale.component.html',
  styleUrls: ['./result-color-scale.component.scss']
})
export class ResultColorScaleComponent {
  @Input() locale = 'en';
  @Input() title?: string;
  @Input() unit = '%';
  @Input() perMille: boolean = false
  @Input() decimals = true;

  digitsInfo(): string {
    return this.decimals ? '1.0-2' : '1.0-0'
  }

  @Input() colors: LegendColor[] = [
    {
      color: '#0072fc',
      quantity: 5,
      opacity: 1
    },
    {
      color: '#03c4ff',
      quantity: 10,
      opacity: 1
    },
    {
      color: '#00ffc4',
      quantity: 15,
      opacity: 1
    },
    {
      color: '#53ff02',
      quantity: 20,
      opacity: 1
    },
    {
      color: '#a9ff02',
      quantity: 25,
      opacity: 1
    },
    {
      color: '#feff00',
      quantity: 30,
      opacity: 1
    },
    {
      color: '#fdaa05',
      quantity: 35,
      opacity: 1
    },
    {
      color: '#fe8201',
      quantity: 70,
      opacity: 1
    },
    {
      color: '#fe4f00',
      quantity: 90,
      opacity: 1
    },
    {
      color: '#f50002',
      quantity: 100,
      opacity: 1
    }
  ];
}
