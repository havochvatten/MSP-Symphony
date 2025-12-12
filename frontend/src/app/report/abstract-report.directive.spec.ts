import { AbstractReport } from './abstract-report.directive';
import { TestBed } from "@angular/core/testing";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { initialState as metadata } from '@data/metadata/metadata.reducers';
import { TranslationSetupModule } from "@src/app/app-translation-setup.module";
import { TranslateService } from "@ngx-translate/core";
import { provideZonelessChangeDetection } from "@angular/core";

describe('AbstractReport', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AbstractReport],
      imports: [TranslationSetupModule],
      providers: [
        provideMockStore({
          initialState: {
            metadata,
            user: {}
          }
        }),
        provideZonelessChangeDetection()
      ]
    }).compileComponents();
  });

  it('should create an instance', () => {
    const directive = new AbstractReport(
      TestBed.inject(TranslateService),
      TestBed.inject(MockStore)
    );
    expect(directive).toBeTruthy();
  });
});
