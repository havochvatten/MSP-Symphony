import { storiesOf, moduleMetadata } from '@storybook/angular';
import { withKnobs } from '@storybook/addon-knobs';
import { withA11y } from '@storybook/addon-a11y';
import { RouterTestingModule } from '@angular/router/testing';
import { HavCoreModule } from 'hav-components';

import { ToolbarButtonComponent, ToolbarZoomButtonsComponent } from './toolbar-button.component';
import markdownNotes from './toolbar-button.component.stories.md';
import { SharedModule } from '@shared/shared.module';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';

const stories = storiesOf('Map | Toolbar Button', module);

stories.addDecorator(withKnobs);
stories.addDecorator(withA11y);
stories.addDecorator(
  moduleMetadata({
    declarations: [ToolbarButtonComponent, ToolbarZoomButtonsComponent],
    imports: [TranslationSetupModule, HavCoreModule, RouterTestingModule, SharedModule]
  })
);

stories.add(
  'default',
  () => ({
    template: `
      <app-toolbar-button>
        <app-icon iconType="search"></app-icon>
      </app-toolbar-button>
    `,
    props: {}
  }),
  {
    notes: { markdown: markdownNotes }
  }
);

stories.add(
  'zoom buttons',
  () => ({
    template: `
      <app-toolbar-zoom-buttons></app-toolbar-zoom-buttons>
    `,
    props: {}
  }),
  {
    notes: { markdown: markdownNotes }
  }
);
