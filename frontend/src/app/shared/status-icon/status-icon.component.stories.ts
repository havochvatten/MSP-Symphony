import { storiesOf, moduleMetadata } from '@storybook/angular';
import { withKnobs, select } from '@storybook/addon-knobs';

import { StatusIconComponent } from './status-icon.component';

import { Status } from './status-icon.component';

const status: Status[] = [
  'INFO',
  'ERROR',
  'WARNING',
  'SUCCESS'
];

const stories = storiesOf('Base | Status Icon', module);

stories.addDecorator(withKnobs);
stories.addDecorator(
  moduleMetadata({
    declarations: [StatusIconComponent]
  })
);

stories.add('default', () => ({
  component: StatusIconComponent,
  props: {
    type: select('Icon', status, 'INFO')
  }
}));
