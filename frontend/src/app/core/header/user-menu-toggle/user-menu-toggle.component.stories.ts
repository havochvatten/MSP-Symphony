import { storiesOf, moduleMetadata } from '@storybook/angular';
import { withKnobs, text } from '@storybook/addon-knobs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HavCoreModule } from 'hav-components';

import { UserMenuToggleComponent } from './user-menu-toggle.component';
import { IconComponent } from '@shared/icon/icon.component';

const stories = storiesOf('Core | User Menu Toggle', module);

stories.addDecorator(withKnobs);
stories.addDecorator(
  moduleMetadata({
    declarations: [UserMenuToggleComponent, IconComponent],
    imports: [FontAwesomeModule, HavCoreModule]
  })
);

stories.add('default', () => ({
  component: UserMenuToggleComponent,
  props: {
    user: text('user', 'Stefan Karlsson')
  }
}));
