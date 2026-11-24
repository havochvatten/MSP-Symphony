import { NgModule, inject, provideAppInitializer } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { TranslatePipe, TranslateService, provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import localeSv from '@angular/common/locales/sv';
import localeEn from '@angular/common/locales/en';
import localeFr from '@angular/common/locales/fr';
import { firstValueFrom, forkJoin } from 'rxjs';
import { Store } from '@ngrx/store';
import { State } from '@src/app/app-reducer';
import { UserSelectors } from '@data/user';
import { defaultLanguage, findBestLanguageMatch, supportedLanguages } from '@shared/languages';

registerLocaleData(localeSv);
registerLocaleData(localeEn);
registerLocaleData(localeFr);

@NgModule({
  imports: [CommonModule, TranslatePipe],
  providers: [
    provideTranslateService({
      loader: provideTranslateHttpLoader({ prefix: './assets/i18n/', suffix: '.json' }),
      fallbackLang: defaultLanguage,
      langs: supportedLanguages
    }),
    // ngx-translate 18 shows the raw key until a language has loaded. Waiting here for both the
    // startup language and the fallback means the login screen never shows keys, not even one
    // that the startup language lacks. The fallback request is the one the service already
    // started, not a second download.
    provideAppInitializer(() => {
      const translate = inject(TranslateService);
      return firstValueFrom(
        forkJoin([
          translate.use(findBestLanguageMatch()),
          translate.setFallbackLang(defaultLanguage)
        ])
      );
    })
  ],
  exports: [TranslatePipe]
})
export class TranslationSetupModule {
  constructor() {
    const translate = inject(TranslateService);
    const store = inject<Store<State>>(Store);

    store.select(UserSelectors.selectUser).subscribe((user) => {
      if (user) {
        translate.use(findBestLanguageMatch(user.settings?.locale));
      }
    });
  }
}
