import { Component, Input, OnInit, NgModuleRef } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  faInfoCircle,
  faDoorClosed, IconDefinition, faGlobe,
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
import { ChangeLanguageDialogComponent } from "@shared/change-language-dialog/change-language-dialog.component";

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
              private moduleRef: NgModuleRef<never>) {
    this.user$ = this.store.select(UserSelectors.selectUser);
  }

  ngOnInit() {
    if (this.title === undefined) {
      throw new Error('Input property `title` is required.');
    }
    this.userMenuItems = [
      {
        name: 'user-menu.change-language',
        icon: gmGlobe,
        click: () => this.changeLanguage()
      },
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
    this.userMenuItems.splice(0, 0,
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

  async changeLanguage() {
    const locale:string | undefined =
      await this.dialogService.open(ChangeLanguageDialogComponent, this.moduleRef, {});
    if (locale) {
      this.store.dispatch(UserActions.updateUserSettings({ locale: locale }));
      this.toggleOpenMenu('NONE');
    }
  }

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

const gmHelpCircle : IconDefinition = {
  prefix: 'fas',
  iconName: 'info-circle',
  icon: [
    24, 24, [], '',
    'm11.94 19.2q0.63 0 1.065-0.435t0.435-1.065-0.435-1.065-1.065-0.435-1.065 0.435-0.435 1.065 0.435 1.065 1.065 0.435zm-1.08-4.62h2.22q0-0.99 0.225-1.56t1.275-1.56q0.78-0.78 1.23-1.485t0.45-1.695q0-1.68-1.23-2.58t-2.91-0.9q-1.71 0-2.775 0.9t-1.485 2.16l1.98 0.78q0.15-0.54 0.675-1.17t1.605-0.63q0.96 0 1.44 0.525t0.48 1.155q0 0.6-0.36 1.125t-0.9 0.975q-1.32 1.17-1.62 1.77t-0.3 2.19zm1.14 9.42q-2.49 0-4.68-0.945t-3.81-2.565-2.565-3.81-0.945-4.68 0.945-4.68 2.565-3.81 3.81-2.565 4.68-0.945 4.68 0.945 3.81 2.565 2.565 3.81 0.945 4.68-0.945 4.68-2.565 3.81-3.81 2.565-4.68 0.945zm0-2.4q4.02 0 6.81-2.79t2.79-6.81-2.79-6.81-6.81-2.79-6.81 2.79-2.79 6.81 2.79 6.81 6.81 2.79z'
  ]
};

const gmGlobe : IconDefinition = {
  prefix: 'fas',
  iconName: 'globe',
  icon: [
    24, 24, [], '',
    'm12.005 0c-6.6176 0-12.005 5.3873-12.005 12.005 0 6.6176 5.3873 11.995 12.005 11.995 6.6176 0 11.995-5.3775 11.995-11.995 0-6.6176-5.3775-12.005-11.995-12.005zm0 1.7501c0.15161 0 0.30122 0.00523 0.45121 0.01172 0.81586 0.24289 1.7006 1.1315 2.4279 2.7053 0.45215 0.97837 0.81937 2.1846 1.0704 3.5354h-7.901c0.25103-1.3509 0.61825-2.5571 1.0704-3.5354 0.72732-1.5738 1.6121-2.4624 2.4279-2.7053 0.15008-0.00649 0.30146-0.01172 0.45316-0.01172zm3.678 0.67974c2.5973 0.99713 4.6825 3.0172 5.7622 5.5727h-3.7718c-0.27022-1.5919-0.70116-3.0313-1.2618-4.2445-0.21924-0.47439-0.46333-0.91976-0.72858-1.3282zm-7.3678 0.00391c-0.26476 0.40736-0.50811 0.85152-0.72662 1.3243-0.56066 1.2132-0.98965 2.6526-1.2599 4.2445h-3.7718c1.0799-2.5524 3.1639-4.5704 5.7583-5.5688zm-6.2603 7.0826h4.0726c-0.080775 0.80305-0.12501 1.635-0.12501 2.4885 0 1.254 0.092613 2.4587 0.26369 3.594h-3.8695c-0.41779-1.1179-0.64654-2.3284-0.64654-3.594 0-0.85819 0.10688-1.6922 0.30471-2.4885zm5.7778 0h8.3425c0.08809 0.79864 0.14064 1.6297 0.14064 2.4885 0 1.2665-0.10814 2.4733-0.29299 3.594h-8.0378c-0.18485-1.1208-0.29299-2.3275-0.29299-3.594 0-0.85881 0.052543-1.6898 0.14064-2.4885zm10.042 0h4.0726c0.19753 0.79625 0.30276 1.6303 0.30276 2.4885 0 1.2657-0.22736 2.4761-0.64458 3.594h-3.8695c0.17108-1.1354 0.26174-2.34 0.26174-3.594 0-0.85346-0.04229-1.6854-0.12306-2.4885zm-14.763 7.5963h3.4378c0.2626 1.1519 0.61236 2.2057 1.0391 3.1292 0.21891 0.47368 0.46324 0.9183 0.72858 1.3263-2.2057-0.84722-4.0409-2.4319-5.2055-4.4554zm5.1801 0h7.4244v2e-3c-0.22643 0.90276-0.50794 1.7187-0.8321 2.4201-0.72793 1.5751-1.6135 2.4633-2.4299 2.7053-0.14934 0.0064-0.2983 0.0098-0.44926 0.0098-0.15105 0-0.30176-0.0033-0.45121-0.0098-0.81643-0.24206-1.702-1.1303-2.4299-2.7053-0.32415-0.7014-0.60567-1.5193-0.8321-2.4221zm9.1589 0h3.4397c-1.1648 2.0262-3.0008 3.6131-5.2094 4.4593 0.26582-0.40908 0.51088-0.85492 0.73053-1.3302 0.42679-0.92349 0.77655-1.9773 1.0391-3.1292z'
  ]
};
