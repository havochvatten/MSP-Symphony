import { Component, Input, OnInit, OnDestroy, NgModuleRef } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  faInfoCircle,
  faDoorClosed,
} from '@fortawesome/free-solid-svg-icons';
import { Observable, Subscription } from 'rxjs';
import { trigger, style, transition, animate, keyframes } from '@angular/animations';

import { State } from '@src/app/app-reducer';
import { UserSelectors, UserActions } from '@data/user';
import { MenuItem } from '@shared/menu/menu.component';
import { IconType } from '@shared/icon/icon.component';
import { DialogService } from "@shared/dialog/dialog.service";
import { AboutDialogComponent } from "@src/app/core/about/about-dialog.component";
import { User } from "@data/user/user.interfaces";

type MenuId = 'main' | 'user';
type OpenState = 'MAIN' | 'USER' | 'NONE';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [
    trigger('openCloseMenu', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)' }),
        animate('0.3s cubic-bezier(0.0, 0.0, 0.2, 0.1)')
      ]),
      transition(':leave', [
        animate(
          '0.25s cubic-bezier(0.4, 0.0, 1, 1)',
          keyframes([
            style({ transform: 'translateY(0)' }),
            style({ transform: 'translateY(-100%)' })
          ])
        )
      ])
    ])
  ]
})
export class HeaderComponent implements OnInit {
  @Input() title: string | undefined;
  menuIcon: IconType = 'menu';
  openState: OpenState = 'NONE';
  userMenuItems?: MenuItem[];
  bothAnimationsAreInProgress = false;
  animationState: Map<MenuId, boolean> = new Map<MenuId, boolean>([
    ['main', false],
    ['user', false]
  ]);
  user$: Observable<User | undefined>;

  constructor(private store: Store<State>,
              private dialogService: DialogService,
              private moduleRef: NgModuleRef<any>) {
    this.user$ = this.store.select(UserSelectors.selectUser);
  }

  ngOnInit() {
    if (this.title === undefined) {
      throw new Error('Input property `title` is required.');
    }
    this.userMenuItems = [
      // {
      //   name: user$,
      //   // icon: faInfoCircle,
      //   // click: this.about
      // },
      {
        name: 'user-menu.about',
        icon: faInfoCircle,
        click: this.about
      },
      {
        name: 'user-menu.logout',
        icon: faDoorClosed,
        click: this.logout
      }
    ];
  }

  toggleOpenMenu = (newState: OpenState) => {
    this.openState = newState !== this.openState ? newState : 'NONE';
  };

  onAnimationStateChange = (menuId: MenuId) => {
    this.animationState.set(menuId, !this.animationState.get(menuId));
    this.bothAnimationsAreInProgress =
      !!this.animationState.get('user') && !!this.animationState.get('main');
  };

  onMenuNavigation = () => {
    this.openState = 'NONE';
  };

  about = () => {
    this.dialogService.open(AboutDialogComponent, this.moduleRef, {});
  };

  logout = () => {
    this.store.dispatch(UserActions.logoutUser());
  };
}
