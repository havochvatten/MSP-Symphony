# Symphony frontend

## Installation

Install Angular CLI globally `npm install -g @angular/cli`. Run `npm install` to install project dependencies.

## Branding & Customization

The MSP-Symphony frontend is now **100 % generic** by default. All country-, organization-, or Sweden-specific logos, images, and texts have been removed from the main repository.

You can easily switch between a clean/generic version and any branded version (e.g. SwAM/HaV or your own organization) **by modifying configuration only** — no code changes are required.

### 1. Asset folder structure

Create your organization-specific logos inside:
frontend/src/assets/branding/
├── swam/                  # ← original SwAM assets
│   ├── hav-logo-blue.svg
│   ├── Sweden-SwAM-white-horizontal-no-borders.svg
│   ├── hav-logo-black.svg
│   ├── sweden-logotype-english-nomargin.svg
│   └── ...
└── your-org/              # ← create this folder for your own branding
    ├── your-logo-blue.svg
    ├── your-decorative-icon.svg
    ├── your-flag.svg
    └── ...

### 2. Main configuration file

The entire branding is controlled by a single runtime file:

**`frontend/src/assets/config/branding.json`**

The application loads this file automatically on startup.

### 3. All configurable fields

| Field                     | Description                                                                                       | Generic default                 |
|---------------------------|---------------------------------------------------------------------------------------------------|---------------------------------|
| `appTitle`                | Page/app title                                                                                    | `"Symphony"`                    |
| `flagAlt`                 | Alternative text for flag                                                                         | `""`                            |
| `flagSrc`                 | Header flag / country logo                                                                        | `""`                            |
| `footerText`              | Footer text                                                                                       | `"Powered by Symphony"`         |
| `loginLogoAlt`            | Alternative text for login logo                                                                   | `""`                            |
| `loginLogoSrc`            | Logo used on login page, optional to adjust since the default is fairly neutral                   | `"assets/long-tailed-duck.svg"` |
| `logoAlt`                 | Alternative text for main logo                                                                    | `"Symphony"`                    |
| `logoSrc`                 | Main organization logo                                                                            | `""`                            |
| `orgName`                 | Organization name                                                                                 | `"Symphony"`                    |
| `reportCountryLogoAlt`    | Alternative text for country logo in reports                                                      | `""`                            |
| `reportCountryLogoSrc`    | Country logo used in reports                                                                      | `""`                            |
| `reportLogoAlt`           | Alternative text for report logo                                                                  | `"Symphony"`                    |
| `reportLogoSrc`           | Logo used in reports                                                                              | `""`                            |
| `showLogo`                | Determines whether to show any of the logos listed here (except login logo which is always shown) | `false`                         |
| `showReportClosingMatter` | Determines whether to Show the closing paragraph, with accompaying link, in reports               | `false`                         |

### 4. Easy switch between versions

You can switch branding without editing the JSON directly by using the environment configuration.

**In `frontend/src/environments/environment.ts` (or `environment.prod.ts` for released builds):**

```ts
export const environment = {
  // ... other settings
  // Change this single line to switch branding
  brandingFile: 'branding.json'           // ← generic (default)
  // brandingFile: 'branding_swam.json'   // ← SwAM branded
};
```

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

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Attributions

The file `attributions.ts` contains a list of 3rd-party components. The information therein is displayed in the
about-dialog. The list (in particular the version numbers) needs to be kept up to date.

## Good ideas for improvement in frontend:
- Enable strict template checking (strictTemplates = true in tsconfig)
- Migrate from ngx-translate to Angular's standard i18n framework
