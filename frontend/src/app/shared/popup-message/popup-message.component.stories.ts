import { storiesOf, moduleMetadata } from '@storybook/angular';
import { withKnobs } from '@storybook/addon-knobs';

import { PopupMessageComponent } from './popup-message.component';
import {provideMockStore} from "@ngrx/store/testing";
import {TranslationSetupModule} from "@src/app/app-translation-setup.module";

const stories = storiesOf('Base | Popup Message', module);

stories.addDecorator(withKnobs);
stories.addDecorator(
  moduleMetadata({
    declarations: [PopupMessageComponent],
    imports: [TranslationSetupModule],
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
