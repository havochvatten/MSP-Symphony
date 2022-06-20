import { Component, Input, EventEmitter, Output } from '@angular/core';
import { IconType } from '@shared/icon/icon.component';

@Component({
  selector: 'app-toolbar-button',
  template: `
    <button
      [attr.aria-label]="label | translate"
      [attr.title]="label | translate"
      [disabled]="disabled"
      [attr.data-active]="active"
    >
      <app-icon [iconType]="icon"></app-icon>
    </button>
  `,
  styleUrls: ['./toolbar-button.component.scss']
})
export class ToolbarButtonComponent {
  @Input() label?: string;
  @Input() icon?: IconType = 'plus';
  @Input() active = false;
  @Input() disabled = false;
}

@Component({
  selector: 'app-toolbar-zoom-buttons',
  template: `
    <div class="zoom-buttons">
      <app-toolbar-button icon="zoom-in" label="map.toolbar.zoom-in" (click)="zoomIn.emit()">
      </app-toolbar-button>
      <app-toolbar-button icon="zoom-out" label="map.toolbar.zoom-out" (click)="zoomOut.emit()">
        <app-icon iconType="zoom-out"></app-icon>
      </app-toolbar-button>
    </div>
  `,
  styleUrls: ['./toolbar-button.component.scss']
})
export class ToolbarZoomButtonsComponent {
  @Output() zoomIn: EventEmitter<void> = new EventEmitter<void>();
  @Output() zoomOut: EventEmitter<void> = new EventEmitter<void>();
}
