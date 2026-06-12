import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-calculation-image',
  templateUrl: './calculation-image.component.html',
  styleUrls: ['./calculation-image.component.scss'],
  standalone: false
})
export class CalculationImageComponent {
  @Input() imageURL?: string;
}
