import { storiesOf, moduleMetadata } from '@storybook/angular';
import { text, withKnobs } from '@storybook/addon-knobs';

import { SearchInputComponent } from './search-input.component';
import { IconComponent } from '../icon/icon.component';

const stories = storiesOf('Base | Search Input', module);

stories.addDecorator(withKnobs);
stories.addDecorator(
  moduleMetadata({
    declarations: [SearchInputComponent, IconComponent]
  })
);

stories.add('default', () => ({
  component: SearchInputComponent,
  props: {
    label: text('Label', 'Sök område'),
    placeholder: text('Placeholder', 'Sökord...')
  }
}));
