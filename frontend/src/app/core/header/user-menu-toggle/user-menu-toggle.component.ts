import { Component, Input } from '@angular/core';
import { User } from "@data/user/user.interfaces";

@Component({
  selector: 'app-user-menu-toggle',
  templateUrl: './user-menu-toggle.component.html',
  styleUrls: ['./user-menu-toggle.component.scss']
})
export class UserMenuToggleComponent {
  @Input() user?: User;
}
