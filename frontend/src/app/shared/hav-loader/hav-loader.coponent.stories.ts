import { storiesOf, moduleMetadata } from '@storybook/angular';
import { withKnobs } from '@storybook/addon-knobs';

import { HavLoaderComponent } from './hav-loader.component';

const stories = storiesOf('Base | HaV Loader', module);

stories.addDecorator(withKnobs);
stories.addDecorator(
  moduleMetadata({
    declarations: [
      HavLoaderComponent
    ]
  })
);

stories.add('default', () => ({
  component: HavLoaderComponent
}));
