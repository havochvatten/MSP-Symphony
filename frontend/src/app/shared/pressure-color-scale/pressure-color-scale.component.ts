import { Component } from '@angular/core';

interface PressureColor {
  color: string;
  min: number;
  max: number;
}

export const colors: PressureColor[] = [
  {
    color: '#0072fc',
    min: 0,
    max: 5
  },
  {
    color: '#03c4ff',
    min: 5,
    max: 10
  },
  {
    color: '#00ffc4',
    min: 10,
    max: 15
  },
  {
    color: '#53ff02',
    min: 15,
    max: 20
  },
  {
    color: '#a9ff02',
    min: 20,
    max: 25
  },
  {
    color: '#feff00',
    min: 25,
    max: 30
  },
  {
    color: '#fdaa05',
    min: 30,
    max: 35
  },
  {
    color: '#fe8201',
    min: 35,
    max: 70
  },
  {
    color: '#fe4f00',
    min: 70,
    max: 90
  },
  {
    color: '#f50002',
    min: 90,
    max: 100
  }
];

@Component({
  selector: 'app-pressure-color-scale',
  templateUrl: './pressure-color-scale.component.html',
  styleUrls: ['./pressure-color-scale.component.scss']
})
export class PressureColorScaleComponent {
  colors = colors;
}
