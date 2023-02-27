import { Component, Input } from '@angular/core';
import { Stroke, Style } from "ol/style";

@Component({
  selector: 'app-calculation-image',
  templateUrl: './calculation-image.component.html',
  styleUrls: ['./calculation-image.component.scss']
})
export class CalculationImageComponent {
  @Input() imageURL?: string;
  @Input() polygon: any;
  @Input() projectionId = 'EPSG:3857';

  readonly outlineStyle = new Style({
    stroke: new Stroke({width: 1.5, color: 'black'})
  })
}
