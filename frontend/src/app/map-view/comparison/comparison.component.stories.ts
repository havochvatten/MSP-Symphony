import { storiesOf, moduleMetadata } from '@storybook/angular';
import { withKnobs } from '@storybook/addon-knobs';
import { RouterTestingModule } from '@angular/router/testing';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

// import markdownNotes from './map-button.component.stories.md';
import { SharedModule } from '@src/app/shared/shared.module';
import { ComparisonComponent } from "@src/app/map-view/comparison/comparison.component";

const stories = storiesOf('Map | Comparison tab', module);

stories.addDecorator(withKnobs);
stories.addDecorator(
  moduleMetadata({
    declarations: [ComparisonComponent],
    imports: [SharedModule, FontAwesomeModule, RouterTestingModule]
  })
);

stories.add('default', () => ({
    component: ComparisonComponent,
    props: {
    }
  }),
);
