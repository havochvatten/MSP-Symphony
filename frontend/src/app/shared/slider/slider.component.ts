import { Component, Input } from '@angular/core';

/* TODO: Refactor - unwrap and delete this component !
         looks like it's concieved solely for scss containment  */

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss']
})
export class SliderComponent {
  @Input() min = 0;
  @Input() max = 100;
  @Input() step = 1;
  @Input() value = 50;
  @Input() disabled = false;
}
