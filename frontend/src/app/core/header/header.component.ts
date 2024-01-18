import { Component, Input, OnInit, NgModuleRef } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  faInfoCircle,
  faDoorClosed, IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { Observable } from 'rxjs';
import { trigger, style, transition, animate, keyframes } from '@angular/animations';

import { environment } from '@src/environments/environment';
import { State } from '@src/app/app-reducer';
import { UserSelectors, UserActions } from '@data/user';
import { MenuItem } from '@shared/menu/menu.component';
import { IconType } from '@shared/icon/icon.component';
import { DialogService } from "@shared/dialog/dialog.service";
import { AboutDialogComponent } from "@src/app/core/about/about-dialog.component";
import { User } from "@data/user/user.interfaces";

type MenuId = 'main' | 'user';
type OpenState = 'MAIN' | 'USER' | 'NONE';

const gmHelpCircle : IconDefinition = {
  prefix: 'fas',
  iconName: 'info-circle',
  icon: [
    24, 24, [], '',
    'm11.94 19.2q0.63 0 1.065-0.435t0.435-1.065-0.435-1.065-1.065-0.435-1.065 0.435-0.435 1.065 0.435 1.065 1.065 0.435zm-1.08-4.62h2.22q0-0.99 0.225-1.56t1.275-1.56q0.78-0.78 1.23-1.485t0.45-1.695q0-1.68-1.23-2.58t-2.91-0.9q-1.71 0-2.775 0.9t-1.485 2.16l1.98 0.78q0.15-0.54 0.675-1.17t1.605-0.63q0.96 0 1.44 0.525t0.48 1.155q0 0.6-0.36 1.125t-0.9 0.975q-1.32 1.17-1.62 1.77t-0.3 2.19zm1.14 9.42q-2.49 0-4.68-0.945t-3.81-2.565-2.565-3.81-0.945-4.68 0.945-4.68 2.565-3.81 3.81-2.565 4.68-0.945 4.68 0.945 3.81 2.565 2.565 3.81 0.945 4.68-0.945 4.68-2.565 3.81-3.81 2.565-4.68 0.945zm0-2.4q4.02 0 6.81-2.79t2.79-6.81-2.79-6.81-6.81-2.79-6.81 2.79-2.79 6.81 2.79 6.81 6.81 2.79z'
  ]
};

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
              private moduleRef: NgModuleRef<never>) {
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


  if(environment.externManual) {
    this.userMenuItems.splice(1, 0,
      {
        name: 'user-menu.support',
        icon: gmHelpCircle,
        click: this.openManual
      });
  }

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

  openManual = () => {
    if(environment.externManual)
      window.open(environment.externManual, '_blank');
  }
}
