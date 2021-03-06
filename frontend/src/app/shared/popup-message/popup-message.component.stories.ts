import { storiesOf, moduleMetadata } from '@storybook/angular';
import { text, withKnobs } from '@storybook/addon-knobs';
import { withA11y } from '@storybook/addon-a11y';

import { PopupMessageComponent } from './popup-message.component';
import {provideMockStore} from "@ngrx/store/testing";
import {HavButtonModule, HavCoreModule} from "hav-components";
import {TranslationSetupModule} from "@src/app/app-translation-setup.module";

const stories = storiesOf('Base | Popup Message', module);

stories.addDecorator(withKnobs);
stories.addDecorator(withA11y);
stories.addDecorator(
  moduleMetadata({
    declarations: [PopupMessageComponent],
    imports: [HavCoreModule, HavButtonModule, TranslationSetupModule],
    providers: [provideMockStore({
      initialState: {
          message: {
              popup: [{
                type: 'INFO',
                title: 'Title goes here',
                message: 'lorem ipsum'
              }]
            }
        }
    })]
  })
);

stories.add('default', () => ({
  component: PopupMessageComponent,
}));
