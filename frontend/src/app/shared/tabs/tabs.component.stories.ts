import { storiesOf, moduleMetadata } from '@storybook/angular';
import { withKnobs, text } from '@storybook/addon-knobs';
import { withA11y } from '@storybook/addon-a11y';
import { RouterTestingModule } from '@angular/router/testing';
import { HavCoreModule } from 'hav-components';

import { TabsComponent } from './tabs.component';
import { TabComponent } from './tab/tab.component';
import { IconComponent } from '../icon/icon.component';

import markdownNotes from './tabs.component.stories.md';

const stories = storiesOf('Base | Tabs', module);

stories.addDecorator(withKnobs);
stories.addDecorator(withA11y);
stories.addDecorator(
  moduleMetadata({
    declarations: [TabsComponent, TabComponent, IconComponent],
    imports: [HavCoreModule, RouterTestingModule]
  })
);

stories.add(
  'default',
  () => ({
    template: `
    <app-tabs>
      <app-tab id="ecosystem" [title]="text('title_1', 'Ekosystem')" icon="fish">
        Some content
      </app-tab>
      <app-tab id="load" [title]="text('title_2', 'Belastning')" icon="triangle">
        Some other content
      </app-tab>
      <app-tab id="matrix" [title]="text('title_3', 'Matris')" icon="matrix">
        Even more content
      </app-tab>
    </app-tabs>
    `,
    props: {
      text
    }
  }),
  {
    notes: { markdown: markdownNotes }
  }
);
