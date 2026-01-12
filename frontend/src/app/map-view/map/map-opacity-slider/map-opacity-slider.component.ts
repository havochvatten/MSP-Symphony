import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-map-opacity-slider',
  templateUrl: './map-opacity-slider.component.html',
  styleUrls: ['./map-opacity-slider.component.scss'],
  standalone: false
})
export class MapOpacitySliderComponent {
  @Output() opacityChange: EventEmitter<number> = new EventEmitter<number>();

  onChange(value: string) {
    this.opacityChange.emit(Number(value));
  }
}
