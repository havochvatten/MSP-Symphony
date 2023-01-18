import { storiesOf, moduleMetadata } from '@storybook/angular';
import { withKnobs } from '@storybook/addon-knobs';

import { SelectComponent, Option } from './select.component';
import { IconComponent } from '../icon/icon.component';

const options: Option[] = [
  {
    label: 'Option 1',
    selected: false
  },
  {
    label: 'Option 2',
    selected: false
  },
  {
    label: 'Option 3',
    selected: false
  }
];

const stories = storiesOf('Base | Select', module);

stories.addDecorator(withKnobs);
stories.addDecorator(
  moduleMetadata({
    declarations: [SelectComponent, IconComponent]
  })
);

stories.add('default', () => ({
  template: `
    <app-select [options]="options"></app-select>
  `,
  props: {
    options
  }
}));
