import { storiesOf, moduleMetadata } from '@storybook/angular';
import { withKnobs, text } from '@storybook/addon-knobs';
import { withA11y } from '@storybook/addon-a11y';
import { RouterTestingModule } from '@angular/router/testing';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HavButtonModule, HavCoreModule, HavSelectModule } from 'hav-components';

// import markdownNotes from './map-button.component.stories.md';
import { SharedModule } from '@src/app/shared/shared.module';
import { ComparisonComponent } from "@src/app/map-view/comparison/comparison.component";

const stories = storiesOf('Map | Comparison tab', module);

stories.addDecorator(withKnobs);
stories.addDecorator(withA11y);
stories.addDecorator(
  moduleMetadata({
    declarations: [ComparisonComponent, HavSelectModule, HavButtonModule],
    imports: [SharedModule, FontAwesomeModule, HavCoreModule, HavButtonModule, HavSelectModule, RouterTestingModule]
  })
);

stories.add('default', () => ({
    component: ComparisonComponent,
    props: {
    }
  }),
);
