import { Component, inject } from '@angular/core';
import { DialogRef } from '@shared/dialog/dialog-ref';

@Component({
  selector: 'app-create-user-area-modal',
  templateUrl: './create-user-area-modal.component.html',
  styleUrls: ['./create-user-area-modal.component.scss'],
  standalone: false
})
export class CreateUserAreaModalComponent {
  private readonly dialog = inject(DialogRef);

  areaName = '';

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
