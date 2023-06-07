import { Component } from '@angular/core';
import { DialogRef } from '@shared/dialog/dialog-ref';
import { DialogConfig } from '@shared/dialog/dialog-config';

@Component({
  selector: 'app-rename-user-area-modal',
  templateUrl: './rename-user-area-modal.component.html',
  styleUrls: ['./rename-user-area-modal.component.scss']
})
export class RenameUserAreaModalComponent {
  areaName = '';

  constructor(private dialog: DialogRef, private config: DialogConfig) {
    this.areaName = this.config.data.areaName;
  }

  onChange(value: string) {
    this.areaName = value;
  }

  save() {
    this.dialog.close(this.areaName);
  }

  close = () => {
    this.dialog.close();
  };

  get hasChanged() {
    return this.areaName !== this.config.data.areaName;
  }
}
