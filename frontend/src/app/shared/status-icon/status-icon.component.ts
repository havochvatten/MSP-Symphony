import { Component, Input } from '@angular/core';

export type Status = 'INFO' | 'ERROR' | 'WARNING' | 'SUCCESS';

@Component({
  selector: 'app-status-icon',
  templateUrl: './status-icon.component.html',
  styleUrls: ['./status-icon.component.scss']
})
export class StatusIconComponent {
  @Input() type: Status = 'INFO';
}
