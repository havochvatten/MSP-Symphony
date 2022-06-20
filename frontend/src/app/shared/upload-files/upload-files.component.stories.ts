import { storiesOf, moduleMetadata } from '@storybook/angular';
import { withKnobs } from '@storybook/addon-knobs';
import { withA11y } from '@storybook/addon-a11y';

import { UploadFilesComponent } from './upload-files.component';
import { IconComponent } from '../icon/icon.component';
import { IconButtonComponent } from '../icon-button/icon-button.component';
import { HavCoreModule } from 'hav-components';
import { DragDropDirective } from '../drag-drop.directive';

const stories = storiesOf('Base | Upload Files', module);

stories.addDecorator(withKnobs);
stories.addDecorator(withA11y);
stories.addDecorator(
  moduleMetadata({
    declarations: [UploadFilesComponent, IconComponent, IconButtonComponent, DragDropDirective],
    imports: [HavCoreModule]
  })
);

stories.add('default', () => ({
  template: `
    <app-upload-files></app-upload-files>
  `,
  props: {}
}));
