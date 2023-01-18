import { storiesOf, moduleMetadata } from '@storybook/angular';
import { withKnobs, select } from '@storybook/addon-knobs';

import { IconComponent } from './icon.component';

import { ICONS } from './icon.component';

const stories = storiesOf('Base | Icon', module);

stories.addDecorator(withKnobs);
stories.addDecorator(
  moduleMetadata({
    declarations: [IconComponent]
  })
);

stories.add('default', () => ({
  template: `
    <style>* { font-size: 3.6rem }</style>
    <app-icon [iconType]="iconType"></app-icon>
  `,
  props: {
    iconType: select('Icon', ICONS, 'plus')
  }
}));
