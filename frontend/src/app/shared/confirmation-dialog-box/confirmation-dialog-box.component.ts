import { Component, EventEmitter, Output, Input } from '@angular/core';
import { IconType } from '../icon/icon.component';

export enum ButtonClicked {
  Cancel,
  Confirm
}

export interface ConfirmationDialogResult {
  buttonClicked: ButtonClicked;
}

@Component({
  selector: 'app-confirmation-dialog-box',
  templateUrl: './confirmation-dialog-box.component.html',
  styleUrls: ['./confirmation-dialog-box.component.scss']
})
export class ConfirmationDialogBoxComponent {
  closeIcon: IconType = 'plus';
  @Input() cancelButtonText = 'Avbryt';
  @Input() confirmButtonText = 'Bekräfta';
  @Output() confirm: EventEmitter<void> = new EventEmitter<void>();
  @Output() cancel: EventEmitter<void> = new EventEmitter<void>();
  @Output() close: EventEmitter<void> = new EventEmitter<void>();

  onConfirm = (event: MouseEvent | KeyboardEvent) => {
    event.stopPropagation();
    event.preventDefault();
    this.confirm.emit();
  };

  onCancel = (event: MouseEvent | KeyboardEvent) => {
    event.stopPropagation();
    event.preventDefault();
    this.cancel.emit();
  };

  onClose = (event: MouseEvent | KeyboardEvent) => {
    event.stopPropagation();
    event.preventDefault();
    this.close.emit();
  };
}

@Component({
  selector: 'app-confirmation-dialog-text',
  template: '<ng-content></ng-content>'
})
export class ConfirmationDialogTextComponent {}
