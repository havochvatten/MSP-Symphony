import { Component, Input } from '@angular/core';

export interface Option {
  label: string;
  selected: boolean;
  disabled?: boolean;
}

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss']
})
export class SelectComponent {
  @Input() disabled = false;
  @Input() form?: string;
  @Input() name?: string;
  @Input() required = false;
  @Input() size?: number;
  @Input() options?: Option[];
}
