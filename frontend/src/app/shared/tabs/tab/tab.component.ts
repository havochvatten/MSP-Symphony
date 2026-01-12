import { Component, Input } from '@angular/core';
import { v4 as uuid } from 'uuid';
import { IconType } from '@shared/icon/icon.component';

@Component({
  selector: 'app-tab',
  template: `
    @if (active) {
      <ng-content></ng-content>
    }
    `,
  standalone: false
})
export class TabComponent {
  @Input() title?: string;
  @Input() icon: IconType = 'info-circle';
  @Input() id: string = uuid();
  active = false
}
