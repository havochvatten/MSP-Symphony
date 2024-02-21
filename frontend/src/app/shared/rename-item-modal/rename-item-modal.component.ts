import { Component } from '@angular/core';
import { DialogRef } from '@shared/dialog/dialog-ref';
import { DialogConfig } from '@shared/dialog/dialog-config';

@Component({
  selector: 'app-rename-user-area-modal',
  templateUrl: './rename-item-modal.component.html',
  styleUrls: ['./rename-item-modal.component.scss']
})
export class RenameItemModalComponent {
  headerText: string;
  itemName = '';

  constructor(private dialog: DialogRef, private config: DialogConfig) {
    this.headerText = this.config.data.headerText
    this.itemName = this.config.data.itemName;
  }

  onChange(value: string) {
    this.itemName = value;
  }

  save() {
    this.dialog.close(this.itemName);
  }

  close = () => {
    this.dialog.close();
  };

  get hasChanged() {
    return this.itemName !== this.config.data.itemName;
  }
}
