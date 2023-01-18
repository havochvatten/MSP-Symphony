import { storiesOf, moduleMetadata } from '@storybook/angular';
import { text, withKnobs } from '@storybook/addon-knobs';

import {
  AccordionBoxComponent,
  AccordionBoxHeaderComponent,
  AccordionBoxContentComponent
} from './accordion-box.component';
import { IconComponent } from '../icon/icon.component';
import { IconButtonComponent } from '../icon-button/icon-button.component';
import { ToggleComponent } from '../toggle/toggle.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

const stories = storiesOf('Base | Accordion Box', module);

stories.addDecorator(withKnobs);
stories.addDecorator(
  moduleMetadata({
    declarations: [
      AccordionBoxComponent,
      AccordionBoxHeaderComponent,
      AccordionBoxContentComponent,
      IconComponent,
      IconButtonComponent,
      ToggleComponent
    ],
    imports: [
      BrowserAnimationsModule
    ]
  })
);

stories.add('default', () => ({
  template: `
    <app-accordion-box>
      <app-accordion-box-header>
        {{text('Header', 'Some header')}}
      </app-accordion-box-header>
      <app-accordion-box-content>
        {{text('Content', 'Some content')}}
      </app-accordion-box-content>
    </app-accordion-box>
  `,
  props: {
    text
  }
}));

stories.add('with Toggle and header', () => ({
  template: `
    <app-accordion-box>
      <app-accordion-box-header>
        <app-toggle></app-toggle>
        <h4 style="margin: 0; font-weight: 600">{{text('Header', 'Some header')}}</h4>
      </app-accordion-box-header>
      <app-accordion-box-content>
        {{text('Content', 'Some content')}}
      </app-accordion-box-content>
    </app-accordion-box>
  `,
  props: {
    text
  }
}));
