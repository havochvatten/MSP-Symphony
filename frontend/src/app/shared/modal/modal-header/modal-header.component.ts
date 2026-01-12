import { Component } from '@angular/core';

@Component({
  selector: 'app-modal-header',
  template: `
    <ng-content></ng-content>
  `,
  styleUrls: ['./modal-header.component.scss'],
  standalone: false
})
export class ModalHeaderComponent {}
