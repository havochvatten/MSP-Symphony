import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { registerLocaleData } from '@angular/common';
import localeSv from '@angular/common/locales/sv';
import localeEn from '@angular/common/locales/en';
import localeFr from '@angular/common/locales/fr';

registerLocaleData(localeSv);
registerLocaleData(localeEn);
registerLocaleData(localeFr);

export type Language = 'en' | 'sv' | 'fr';
export const supportedLanguages = ['en', 'sv', 'fr'];

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function findBestLanguageMatch(candidateLanguages: string[]) {
  for (const lang of navigator.languages) {
    if (candidateLanguages.includes(lang)) {
      return lang;
    }
  }
  return false;
}

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    }),
  ],
  exports: [TranslateModule]
})
export class TranslationSetupModule {
  constructor(translate: TranslateService) {
    translate.setDefaultLang('en');
    translate.use('en');
  }
}
