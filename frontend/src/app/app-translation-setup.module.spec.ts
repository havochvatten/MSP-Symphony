import { ApplicationInitStatus, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateService } from '@ngx-translate/core';
import { provideMockStore } from '@ngrx/store/testing';
import { UserSelectors } from '@data/user';
import { TranslationSetupModule } from './app-translation-setup.module';

describe('TranslationSetupModule', () => {
  let httpMock: HttpTestingController;
  let status: ApplicationInitStatus;

  // Whichever language the browser asks for, every language file request must be answered.
  const languageFileRequests = () => httpMock.match((req) => req.url.startsWith('./assets/i18n/'));

  // TestBed creates the module lazily, so a test can still change the browser language
  // before calling this.
  const startApplication = () => {
    httpMock = TestBed.inject(HttpTestingController);
    status = TestBed.inject(ApplicationInitStatus);
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslationSetupModule],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideMockStore({
          selectors: [{ selector: UserSelectors.selectUser, value: undefined }]
        })
      ]
    });
  });

  afterEach(() => httpMock.verify());

  it('does not finish starting until the language file has loaded', async () => {
    startApplication();
    expect(status.done).toBeFalse();

    languageFileRequests().forEach((request) => request.flush({ greeting: 'Hello' }));
    await status.donePromise;

    expect(status.done).toBeTrue();
    expect(TestBed.inject(TranslateService).instant('greeting')).toBe('Hello');
  });

  it('starts with a non-English browser language', async () => {
    spyOnProperty(navigator, 'language').and.returnValue('sv-SE');
    startApplication();
    expect(status.done).toBeFalse();

    languageFileRequests().forEach((request) => request.flush({ greeting: 'Hej' }));
    await status.donePromise;

    expect(status.done).toBeTrue();
  });

  it('also waits for the fallback language, so keys missing from the startup language never show', async () => {
    spyOnProperty(navigator, 'language').and.returnValue('sv-SE');
    startApplication();

    httpMock.expectOne('./assets/i18n/sv.json').flush({ greeting: 'Hej' });
    // A timer lets every pending promise settle, so a finished start would show by now.
    await new Promise((resolve) => setTimeout(resolve));
    expect(status.done).toBeFalse();

    httpMock.expectOne('./assets/i18n/en.json').flush({ greeting: 'Hello', farewell: 'Goodbye' });
    await status.donePromise;

    const translate = TestBed.inject(TranslateService);
    expect(translate.instant('greeting')).toBe('Hej');
    expect(translate.instant('farewell')).toBe('Goodbye');
  });

  it('still starts when the language file fails to load', async () => {
    const warn = spyOn(console, 'warn');
    startApplication();

    languageFileRequests().forEach((request) =>
      request.flush(null, { status: 404, statusText: 'Not Found' })
    );
    await status.donePromise;

    expect(status.done).toBeTrue();
    expect(TestBed.inject(TranslateService).instant('greeting')).toBe('greeting');
    expect(warn).toHaveBeenCalled();
  });
});
