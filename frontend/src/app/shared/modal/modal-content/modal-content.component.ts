import { Component } from '@angular/core';

@Component({
  selector: 'app-modal-content',
  template: `
    <ng-content></ng-content>
  `,
  styleUrls: ['./modal-content.component.scss'],
  standalone: false
})
export class ModalContentComponent {}
