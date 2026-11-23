import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { TranslateSpecModule } from '@src/testing/translate-spec.module';
import { injectCurrentLocale } from './current-locale';
import { defaultLanguage } from './languages';

describe('injectCurrentLocale', () => {
  let translate: TranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateSpecModule],
      providers: [provideZonelessChangeDetection()]
    });
    translate = TestBed.inject(TranslateService);
  });

  const create = () => TestBed.runInInjectionContext(() => injectCurrentLocale());

  it('starts with the current language', () => {
    translate.use('sv');
    expect(create()()).toBe('sv');
  });

  it('follows a language switch', () => {
    translate.use('sv');
    const locale = create();
    translate.use('en');
    expect(locale()).toBe('en');
  });

  it('falls back to the default language before any language is set', () => {
    expect(create()()).toBe(defaultLanguage);
  });
});
