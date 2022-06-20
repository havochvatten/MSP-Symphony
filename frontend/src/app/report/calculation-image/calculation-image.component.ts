import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-calculation-image',
  templateUrl: './calculation-image.component.html',
  styleUrls: ['./calculation-image.component.scss']
})
export class CalculationImageComponent {
  @Input() imageURL?: string;
}
