import { storiesOf, moduleMetadata } from '@storybook/angular';
import { action } from '@storybook/addon-actions';
import { withKnobs, select } from '@storybook/addon-knobs';

import { IconButtonComponent } from './icon-button.component';
import { IconComponent } from '../icon/icon.component';

import { ICONS } from '@shared/icon/icon.component';

const stories = storiesOf('Base | Icon Button', module);

stories.addDecorator(withKnobs);
stories.addDecorator(
  moduleMetadata({
    declarations: [IconButtonComponent, IconComponent]
  })
);

stories.add('default', () => ({
  component: IconButtonComponent,
  props: {
    label: 'this is a button',
    icon: select('Icon', ICONS, 'plus'),
    click: action('You clicked me!')
  }
}));
