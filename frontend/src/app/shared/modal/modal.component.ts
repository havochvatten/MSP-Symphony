import { Component } from '@angular/core';

@Component({
  selector: 'app-modal',
  template: `
    <ng-content select="app-modal-header"></ng-content>
    <ng-content select="app-modal-content"></ng-content>
    <ng-content select="app-modal-footer"></ng-content>
  `,
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent {}
