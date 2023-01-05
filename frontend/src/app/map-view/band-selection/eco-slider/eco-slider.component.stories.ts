import { storiesOf, moduleMetadata } from '@storybook/angular';
import { withKnobs } from '@storybook/addon-knobs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { StoreModule } from '@ngrx/store';
import { HavCoreModule } from 'hav-components';

import { SharedModule } from 'src/app/shared/shared.module';
import { EcoSliderComponent } from './eco-slider.component';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';

const stories = storiesOf('Map | Eco Slider', module);

stories.addDecorator(withKnobs);
stories.addDecorator(
  moduleMetadata({
    declarations: [EcoSliderComponent],
    imports: [TranslationSetupModule, FontAwesomeModule, HavCoreModule, SharedModule, StoreModule.forRoot({})]
  })
);

stories.add('default', () => ({
  component: EcoSliderComponent,
  props: {
    title: 'Siklöja',
    intensity: 1.1,
    layerOpacity: 100
  }
}));
