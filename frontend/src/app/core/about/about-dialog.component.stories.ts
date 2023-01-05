import { storiesOf, moduleMetadata } from '@storybook/angular';
import { withKnobs, text } from '@storybook/addon-knobs';
import { HavButtonModule, HavCoreModule } from 'hav-components';
import { AboutDialogComponent } from "@src/app/core/about/about-dialog.component";
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';
import { DialogRef } from "@shared/dialog/dialog-ref";
import { SharedModule } from "@shared/shared.module";

const stories = storiesOf('Core | About Dialog', module);

class MockDialogRef {
  close = () => {}
}

stories.addDecorator(withKnobs);
stories.addDecorator(
  moduleMetadata({
    declarations: [AboutDialogComponent],
    imports: [HavCoreModule, TranslationSetupModule, HavButtonModule, SharedModule],
    providers: [
      { provide: DialogRef, useClass: MockDialogRef }
    ]
  })
);

stories.add('default', () => ({
  component: AboutDialogComponent,
  props: {
  }
}));
