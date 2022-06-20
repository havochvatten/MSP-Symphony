import { Component, Output, EventEmitter, Input } from '@angular/core';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';

export interface MenuItem {
  url?: string | any[];
  click?: Function;
  name: string;
  icon?: IconDefinition;
}

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
  @Output() navigate: EventEmitter<void> = new EventEmitter<void>();
  @Input() menuItems?: MenuItem[];
  @Input() menuLabel?: string;

  onNavigate = () => {
    this.navigate.emit();
  };
}
