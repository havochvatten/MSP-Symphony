import { storiesOf, moduleMetadata } from '@storybook/angular';
import { withKnobs } from '@storybook/addon-knobs';
import { withA11y } from '@storybook/addon-a11y';

import { ImpactTableComponent } from './impact-table.component';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';

const stories = storiesOf('Report | Impact Table', module);

stories.addDecorator(withKnobs);
stories.addDecorator(withA11y);
stories.addDecorator(
  moduleMetadata({
    declarations: [ImpactTableComponent],
    imports: [TranslationSetupModule]
  })
);

stories.add('default', () => ({
  component: ImpactTableComponent,
  props: {
    title: 'Impacts Per Pressure',
    bandGroups: [
      {
        symphonyTeamName: 'Birds',
        symphonyTeamNameLocal: 'Fågel',
        displayName: 'Birds',
        properties: [
          {
            id: 611,
            title: 'Coastal bird',
            titleLocal: 'Kustfågel',
            displayName: 'Coastal bird',
            marinePlaneArea: 'East, West, North',
            bandNumber: 2
          },
          {
            id: 633,
            title: 'Seabird coastal wintering',
            titleLocal: 'Sjöfågel övervintringsområde kust',
            displayName: 'Seabird coastal wintering',
            bandNumber: 24
          },
          {
            id: 634,
            title: 'Seabird offshore wintering',
            titleLocal: 'Sjöfågel övervintringsområde utsjö',
            displayName: 'Seabird offshore wintering',
            bandNumber: 25
          }
        ]
      },
      {
        symphonyTeamName: 'Fish',
        symphonyTeamNameLocal: 'Fisk',
        displayName: 'Fish',
        properties: [
          {
            id: 612,
            title: 'Cod',
            titleLocal: 'Torsk',
            displayName: 'Cod',
            bandNumber: 3
          },
          {
            id: 622,
            title: 'Herring',
            titleLocal: 'Sill',
            displayName: 'Herring',
            bandNumber: 13
          },
          {
            id: 629,
            title: 'Rivermouth fish',
            titleLocal: 'Fisk älvmynning',
            displayName: 'Rivermouth fish',
            bandNumber: 20
          },
          {
            id: 639,
            title: 'Sprat',
            titleLocal: 'Skarpsill',
            displayName: 'Sprat',
            bandNumber: 5
          }
        ]
      }
    ],
    impacts: [
      0,
      0.0016226214178657087,
      0,
      0.12565203825498225,
      0,
      0,
      0.0935176496686191,
      0.006280202253722845,
      0,
      0.000009219226192137661,
      0.0015860313297805211,
      0.0007200816555261978,
      0,
      0.08552656974932735,
      0.000005005188940210867,
      0.08403532530504211,
      0.022199660514238172,
      0.0000013522306031840405,
      0,
      0,
      0,
      0.0001717324017090909,
      0.00011069553288507549,
      0,
      0,
      0.0011399351547966225,
      0,
      0.004443814249062864,
      0.16575202498424685,
      0,
      0.060025714913123515,
      0.005344231147620314,
      0.01690522209231452,
      0,
      0,
    ]
  }
}));
