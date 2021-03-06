import { storiesOf, moduleMetadata } from '@storybook/angular';
import { withKnobs } from '@storybook/addon-knobs';
import { withA11y } from '@storybook/addon-a11y';
import { RouterTestingModule } from '@angular/router/testing';
import { HavCoreModule } from 'hav-components';

import { MapToolbarComponent } from './map-toolbar.component';
import { ToolbarZoomButtonsComponent, ToolbarButtonComponent } from '../toolbar-button/toolbar-button.component';
import { SharedModule } from '@src/app/shared/shared.module';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';

const stories = storiesOf('Map | Map Toolbar', module);

stories.addDecorator(withKnobs);
stories.addDecorator(withA11y);
stories.addDecorator(
  moduleMetadata({
    declarations: [MapToolbarComponent, ToolbarZoomButtonsComponent, ToolbarButtonComponent],
    imports: [SharedModule, TranslationSetupModule, HavCoreModule, RouterTestingModule]
  })
);

stories.add('default', () => ({
  component: MapToolbarComponent,
  props: {}
}));
