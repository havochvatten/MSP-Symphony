import { storiesOf, moduleMetadata } from '@storybook/angular';
import { withKnobs, select } from '@storybook/addon-knobs';
import { withA11y } from '@storybook/addon-a11y';

import { CumulativeEffectEtcComponent } from './cumulative-effect-etc.component';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';

const stories = storiesOf('Report | Cumulative Effect', module);

stories.addDecorator(withKnobs);
stories.addDecorator(withA11y);
stories.addDecorator(
  moduleMetadata({
    declarations: [CumulativeEffectEtcComponent],
    imports: [TranslationSetupModule]
  })
);

stories.add('default', () => ({
  component: CumulativeEffectEtcComponent,
  props: {
    total: 6549744427.192745,
    average: 43116.82245,
    min: 27097.923443,
    max: 67658.425665,
    stddev: 4600.350211,
    area: 9493810232.0345,
    locale: select('Locale', { en: 'en', sv: 'sv' }, 'en')
  }
}));
