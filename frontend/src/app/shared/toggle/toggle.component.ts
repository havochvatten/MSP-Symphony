import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.scss']
})
export class ToggleComponent {
  @Input() checked = false;
  @Input() check: (checked: boolean) => void = (checked: boolean) => (this.checked = checked);
}
