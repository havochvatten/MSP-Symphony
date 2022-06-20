import { Component } from '@angular/core';

@Component({
  selector: 'app-modal-footer',
  template: `
    <ng-content></ng-content>
  `,
  styleUrls: ['./modal-footer.component.scss']
})
export class ModalFooterComponent {}
