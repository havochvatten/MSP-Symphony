import { storiesOf, moduleMetadata } from '@storybook/angular';
import { withKnobs, text } from '@storybook/addon-knobs';
import { withA11y } from '@storybook/addon-a11y';
import { APP_BASE_HREF } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faLifeRing,
  faInfoCircle,
  faUserCircle,
  faDoorClosed
} from '@fortawesome/free-solid-svg-icons';
import { HavCoreModule } from 'hav-components';

import { MenuComponent } from './menu.component';
import markdownNotes from './menu.component.stories.md';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';

const stories = storiesOf('Base | Menu', module);

stories.addDecorator(withKnobs);
stories.addDecorator(withA11y);
stories.addDecorator(
  moduleMetadata({
    declarations: [MenuComponent],
    imports: [TranslationSetupModule, FontAwesomeModule, HavCoreModule, RouterTestingModule],
    providers: [{ provide: APP_BASE_HREF, useValue: '/' }]
  })
);

stories.add(
  'default',
  () => ({
    component: MenuComponent,
    props: {
      menuItems: [
        {
          name: text('name_1', 'Hjälp', 'Item 1'),
          url: 'help',
          icon: faLifeRing
        },
        {
          name: text('name_2', 'Om Symphony', 'Item 2'),
          url: 'about',
          icon: faInfoCircle
        },
        {
          name: text('name_3', 'Min Profil', 'Item 3'),
          url: ['user'],
          icon: faUserCircle
        },
        {
          name: text('name_4', 'Logga ut', 'Item 4'),
          url: 'logout',
          icon: faDoorClosed
        }
      ]
    }
  }),
  {
    notes: { markdown: markdownNotes }
  }
);
