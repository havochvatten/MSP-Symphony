import { storiesOf, moduleMetadata } from '@storybook/angular';
import { withKnobs, select } from '@storybook/addon-knobs';

import { HighestImpactsComponent } from './highest-impacts.component';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';

const bandGroups = [
  {
    displayName: 'Fisk',
    properties: [
      {
        displayName: 'Siklöja',
        bandNumber: 0
      },
      {
        displayName: 'Torsk',
        bandNumber: 1
      },
      {
        displayName: 'Sill',
        bandNumber: 2
      }
    ]
  },
  {
    displayName: 'Fågel',
    properties: [
      {
        displayName: 'Alfågel',
        bandNumber: 3
      },
      {
        displayName: 'Silltrut',
        bandNumber: 4
      },
      {
        displayName: 'Ful ankunge',
        bandNumber: 5
      }
    ]
  }
];

const impacts: number[] = [0.34, 0.23, 0.03, 0.8, 0.05, 0.123];

const stories = storiesOf('Report | Highest Impacts', module);

stories.addDecorator(withKnobs);
stories.addDecorator(
  moduleMetadata({
    declarations: [HighestImpactsComponent],
    imports: [TranslationSetupModule]
  })
);

stories.add('default', () => ({
  component: HighestImpactsComponent,
  props: {
    title: 'Impact Per Pressure',
    locale: select('Locale', { en: 'en', sv: 'sv' }, 'en'),
    bandGroups,
    impacts
  }
}));
