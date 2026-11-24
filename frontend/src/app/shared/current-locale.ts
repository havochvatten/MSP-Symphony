import { DestroyRef, Signal, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { defaultLanguage } from '@shared/languages';

/**
 * The current UI language as a signal, for number and date formatting in templates.
 * A plain field copied from getCurrentLang() at construction stays stale after a language
 * switch, and a field set from a subscription does not re-render in a zoneless app.
 * Must be called in an injection context.
 */
export function injectCurrentLocale(): Signal<string> {
  const translate = inject(TranslateService);
  const locale = signal(translate.getCurrentLang() ?? defaultLanguage);
  const subscription = translate.onLangChange.subscribe((event) => locale.set(event.lang));
  inject(DestroyRef).onDestroy(() => subscription.unsubscribe());
  return locale.asReadonly();
}
