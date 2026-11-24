import { Component, HostBinding, Input } from '@angular/core';

export const MAX_SHOWN_NAMES = 3;

/**
 * The line under a collapsed category that names its layers on the map:
 * the first few in list order, then a count of the rest. The full list is
 * in the tooltip.
 */
@Component({
  selector: 'app-on-map-names',
  templateUrl: './on-map-names.component.html',
  styleUrls: ['./on-map-names.component.scss'],
  standalone: false
})
export class OnMapNamesComponent {
  @Input() names: readonly string[] = [];

  @HostBinding('attr.title') get title(): string {
    return this.names.join(', ');
  }

  get shownNames(): string[] {
    return this.names.slice(0, MAX_SHOWN_NAMES);
  }

  get hiddenCount(): number {
    return Math.max(this.names.length - MAX_SHOWN_NAMES, 0);
  }
}
