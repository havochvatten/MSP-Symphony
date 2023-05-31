import { storiesOf, moduleMetadata } from '@storybook/angular';
import { withKnobs } from '@storybook/addon-knobs';
import { RouterTestingModule } from '@angular/router/testing';

import { MapToolbarComponent } from './map-toolbar.component';
import { ToolbarZoomButtonsComponent, ToolbarButtonComponent } from '../toolbar-button/toolbar-button.component';
import { SharedModule } from '@shared/shared.module';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';

const stories = storiesOf('Map | Map Toolbar', module);

stories.addDecorator(withKnobs);
stories.addDecorator(
  moduleMetadata({
    declarations: [MapToolbarComponent, ToolbarZoomButtonsComponent, ToolbarButtonComponent],
    imports: [SharedModule, TranslationSetupModule, RouterTestingModule]
  })
);

stories.add('default', () => ({
  component: MapToolbarComponent,
  props: {}
}));
