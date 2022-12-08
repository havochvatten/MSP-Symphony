import { Component, EventEmitter, Output, Input } from '@angular/core';

@Component({
  selector: 'app-map-toolbar',
  templateUrl: './map-toolbar.component.html',
  styleUrls: ['./map-toolbar.component.scss']
})
export class MapToolbarComponent {
  @Input() hasResults = false;
  @Input() drawIsActive = false;
  @Input() hasImageSmoothing = false;
  @Output() zoomIn: EventEmitter<void> = new EventEmitter<void>();
  @Output() zoomOut: EventEmitter<void> = new EventEmitter<void>();
  @Output() clearResult: EventEmitter<void> = new EventEmitter<void>();
  @Output() toggleDraw: EventEmitter<void> = new EventEmitter<void>();
  @Output() toggleSmooth: EventEmitter<void> = new EventEmitter<void>();
  @Output() setMapOpacity: EventEmitter<number> = new EventEmitter<number>();

  onClickZoomIn() {
    this.zoomIn.emit();
  }

  onClickZoomOut() {
    this.zoomOut.emit();
  }

  onClearResult = () => this.clearResult.emit();

  onToggleDraw = () => this.toggleDraw.emit();

  onToggleSmooth = () => this.toggleSmooth.emit();

  onClickSetMapOpacity = (opacity: number) => this.setMapOpacity.emit(opacity);

}
