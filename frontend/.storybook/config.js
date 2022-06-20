import { configure } from '@storybook/angular';

// automatically import all files ending in *.stories.ts
const req = require.context('../src/app', true, /\.stories\.ts$/);
function loadStories() {
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
