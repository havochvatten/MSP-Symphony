import { storiesOf, moduleMetadata } from '@storybook/angular';
import { withKnobs, text } from '@storybook/addon-knobs';
import { RouterTestingModule } from '@angular/router/testing';

import { TabsComponent } from './tabs.component';
import { TabComponent } from './tab/tab.component';
import { IconComponent } from '../icon/icon.component';

import markdownNotes from './tabs.component.stories.md';

const stories = storiesOf('Base | Tabs', module);

stories.addDecorator(withKnobs);
stories.addDecorator(
  moduleMetadata({
    declarations: [TabsComponent, TabComponent, IconComponent],
    imports: [RouterTestingModule]
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
