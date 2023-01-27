import { storiesOf, moduleMetadata } from '@storybook/angular';
import { withKnobs, text } from '@storybook/addon-knobs';
import { RouterTestingModule } from '@angular/router/testing';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFish, faShip, faBraille } from '@fortawesome/free-solid-svg-icons';

import { IconComponent } from '../icon/icon.component';
import { NoteComponent } from './note.component';
import markdownNotes from './note.component.stories.md';

const stories = storiesOf('Base | Note', module);

stories.addDecorator(withKnobs);
stories.addDecorator(
  moduleMetadata({
    declarations: [NoteComponent, IconComponent],
    imports: [FontAwesomeModule, RouterTestingModule]
  })
);

stories.add(
  'default',
  () => ({
    template: `
      <app-note>
        Om du har justerat standardvärden i någon karta kan du spara den/de
        justerade kartorna för att sedan använda dem i dina beräkningar.
      </app-note>
    `,
    props: {
      faFish,
      faShip,
      faBraille,
      text
    }
  }),
  {
    notes: { markdown: markdownNotes }
  }
);
