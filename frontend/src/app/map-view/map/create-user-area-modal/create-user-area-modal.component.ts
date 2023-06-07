import { Component } from '@angular/core';
import { DialogRef } from '@shared/dialog/dialog-ref';

@Component({
  selector: 'app-create-user-area-modal',
  templateUrl: './create-user-area-modal.component.html',
  styleUrls: ['./create-user-area-modal.component.scss']
})
export class CreateUserAreaModalComponent {
  areaName = '';
  constructor(private dialog: DialogRef) {}

  onChange(value: string) {
    this.areaName = value;
  }

  save() {
    this.dialog.close(this.areaName);
  }

  close = () => {
    this.dialog.close();
  };
}
