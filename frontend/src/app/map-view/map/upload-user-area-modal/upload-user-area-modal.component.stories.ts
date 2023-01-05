import { storiesOf, moduleMetadata } from '@storybook/angular';
import { withKnobs } from '@storybook/addon-knobs';
import { ButtonComponent, HavButtonModule, HavCoreModule } from 'hav-components';

import { SharedModule } from '@shared/shared.module';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';
import {
  UploadUserAreaModalComponent
} from "@src/app/map-view/map/upload-user-area-modal/upload-user-area-modal.component";
import { DialogRef } from "@shared/dialog/dialog-ref";

const stories = storiesOf('Base | Upload User Area', module);

class MockDialogRef {
  close = () => {}
}

stories.addDecorator(withKnobs);
stories.addDecorator(
  moduleMetadata({
    declarations: [UploadUserAreaModalComponent],
    imports: [HavCoreModule, TranslationSetupModule, HavButtonModule, SharedModule],
    providers: [
      { provide: DialogRef, useClass: MockDialogRef }
    ]
  })
);

stories.add('default', () => ({
    template: `<app-upload-user-area-modal></app-upload-user-area-modal>`,
    props: {}
  }),
);
