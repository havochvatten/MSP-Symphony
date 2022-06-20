import { Component, Input } from '@angular/core';
import * as uuid from 'uuid/v4';
import { IconType } from '@shared/icon/icon.component';

@Component({
  selector: 'app-tab',
  template: `
    <ng-content *ngIf="active"></ng-content>
  `
})
export class TabComponent {
  @Input() title?: string;
  @Input() icon: IconType = 'info-circle';
  @Input() id: string = uuid();
  active = false;
}
