import { storiesOf, moduleMetadata } from '@storybook/angular';
import { withKnobs } from '@storybook/addon-knobs';
import { SharedModule } from '@shared/shared.module';

import { AreaGroupComponent } from './area-group.component';
import { AreaGroup } from '@data/area/area.interfaces';

const areas: AreaGroup[] = [
  {
    name: 'MSP-area',
    statePath: [],
    visible: true,
    sv: '',
    en: '',
    areas: []
  },
  {
    name: 'Area',
    statePath: [],
    visible: false,
    sv: '',
    en: '',
    areas: []
  }
]

const stories = storiesOf('Base | Area Group', module);

stories.addDecorator(withKnobs);
stories.addDecorator(
  moduleMetadata({
    declarations: [AreaGroupComponent],
    imports: [SharedModule]
  })
);

stories.add('default', () => ({
  component: AreaGroupComponent,
  props: {
    title: 'MSP area',
    areas
  }
}));
