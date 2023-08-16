# Symphony frontend

## Installation

Install Angular CLI globally `npm install -g @angular/cli`. Run `npm install` to install project dependencies.

## Development server

Run `ng serve --ssl` (or `npm start`) for a dev server. Navigate to [https://localhost:4200/](https://localhost:4200/). The app will automatically reload if you change any of the source files.
 
There is a possibility of pointing the dev server frontend code to various backend configurations by setting a `PROXY_TARGET` environment variable. See the file `proxy.conf.json` for more information.

### Local SSL certificate

To avoid browser complaints of bad SSL certificate (and make autocomplete work in login form when using devserver) you can generate your own certificate using `ng run generate-cert`. Make sure you also tell your machine to trust it as a root certificate.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--configuration="production"` option for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

~~Run `ng e2e` to execute the end-to-end tests~~  
We're switching to Cypress for e2e testing. However, no specs are written as of now.
See [Cypress](https://www.cypress.io/) for more information.

## Storybook

Run `npm run storybook` for a dev server. Navigate to [https://localhost:6006/](https://localhost:6006/) (it usually opens a Chrome tab automatically). Storybook will automatically update if you change any of the source files.

A tutorial for working with [Storybook](https://storybook.js.org/) in Angular can be found at [learnstorybook.com](https://www.learnstorybook.com/angular/en/get-started/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Attributions

The file `attributions.ts` contains a list of 3rd-party components. The information therein is displayed in the
about-dialog. The list (in particular the version numbers) needs to be kept up to date.

## Good ideas for improvement in frontend:
- Enable strict template checking (strictTemplates = true in tsconfig)
- Migrate from ngx-translate to Angular's standard i18n framework
