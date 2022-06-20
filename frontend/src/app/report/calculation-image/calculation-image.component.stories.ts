import { storiesOf, moduleMetadata } from '@storybook/angular';
import { withKnobs } from '@storybook/addon-knobs';
import { withA11y } from '@storybook/addon-a11y';

import { CalculationImageComponent } from './calculation-image.component';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';
declare function require(path: string): any;
const imageURL = require('./calc-story.png')

const stories = storiesOf('Report | Calculation Image', module);

stories.addDecorator(withKnobs);
stories.addDecorator(withA11y);
stories.addDecorator(
  moduleMetadata({
    declarations: [CalculationImageComponent],
    imports: [TranslationSetupModule]
  })
);

stories.add('default', () => ({
  component: CalculationImageComponent,
  props: {
    imageURL
  }
}));
