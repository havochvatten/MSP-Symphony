import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-selection-layout',
  templateUrl: './selection-layout.component.html',
  styleUrls: ['./selection-layout.component.scss']
})
export class SelectionLayoutComponent {
  @Input() title?: string;
  @Input() selectedAreaName?: string;
  @Input() searchLabel?: string;
  @Input() searchValue?: string;
  @Input() searchPlaceholder?: string;
  @Input() onSearch: (value: string) => void = (value: string) => (this.searchValue = value);
}
