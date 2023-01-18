import { storiesOf, moduleMetadata } from '@storybook/angular';
import { withKnobs } from '@storybook/addon-knobs';

import { UploadFilesComponent } from './upload-files.component';
import { IconComponent } from '../icon/icon.component';
import { IconButtonComponent } from '../icon-button/icon-button.component';
import { DragDropDirective } from '../drag-drop.directive';

const stories = storiesOf('Base | Upload Files', module);

stories.addDecorator(withKnobs);
stories.addDecorator(
  moduleMetadata({
    declarations: [UploadFilesComponent, IconComponent, IconButtonComponent, DragDropDirective]
  })
);

stories.add('default', () => ({
  template: `
    <app-upload-files></app-upload-files>
  `,
  props: {}
}));
