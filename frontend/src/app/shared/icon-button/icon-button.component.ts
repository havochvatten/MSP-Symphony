import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { IconType } from '@shared/icon/icon.component';

@Component({
  selector: 'app-icon-button',
  templateUrl: './icon-button.component.html',
  styleUrls: ['./icon-button.component.scss']
})
export class IconButtonComponent implements OnInit {
  @Input() disabled = false;
  @Input() icon?: IconType;
  @Input() label: string | undefined;
  @Input() onDarkBackground = false;
  @Output() iconClick = new EventEmitter<MouseEvent | KeyboardEvent>();

  ngOnInit(): void {
    if (this.label === undefined) {
      throw new Error('Input property `label` is required.');
    }
    if (this.icon === undefined) {
      throw new Error('Input property `icon` is required.');
    }
  }

  onClick = (event: MouseEvent) => {
    this.handleEvent(event);
    this.iconClick.emit(event);
  };

  onEnterKeyDown = (event: KeyboardEvent) => {
    this.handleEvent(event);
  };

  onEnterKeyUp = (event: KeyboardEvent) => {
    this.handleEvent(event);
    this.iconClick.emit(event);
  };

  private handleEvent = (event: KeyboardEvent | MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
  };
}
