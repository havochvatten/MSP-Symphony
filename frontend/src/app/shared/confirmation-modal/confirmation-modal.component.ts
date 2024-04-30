import { Component, ElementRef, HostBinding } from '@angular/core';
import { DialogRef } from "@shared/dialog/dialog-ref";
import { DialogConfig } from "@shared/dialog/dialog-config";

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss']
})
export class ConfirmationModalComponent  {

  @HostBinding('class.app-confirmation-modal') dialogClass = true;

  header!: string;
  message?: string | null;
  confirmText?: string | null;
  cancelText?: string | null;
  confirmClass?: string | null;
  cancelClass?: string | null;
  buttonsClass?: string | null;
  matColorCancel: string;
  matColorConfirm: string;

  constructor(private dialog: DialogRef,
              private element: ElementRef,
              conf: DialogConfig ) {
    this.header = conf.data.header;
    this.message = conf.data.message || null;
    this.confirmText = conf.data.confirmText || null;
    this.cancelText = conf.data.cancelText || null;
    this.confirmClass = conf.data.confirmClass || null;
    this.cancelClass = conf.data.cancelClass || "secondary";
    this.buttonsClass = conf.data.buttonsClass || null;
    this.matColorConfirm = conf.data.confirmColor || "primary";
    this.matColorCancel = conf.data.cancelColor || "primary";
    this.element.nativeElement.className = conf.data.dialogClass || null;
  }

  confirm() {
    this.dialog.close(true);
  }

  cancel = () => {
    this.dialog.close(false);
  };
}
