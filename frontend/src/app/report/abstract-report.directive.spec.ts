import { AbstractReport } from './abstract-report.directive';
import { TestBed, waitForAsync } from "@angular/core/testing";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { initialState as metadata } from '@data/metadata/metadata.reducers';
import { TranslationSetupModule } from "@src/app/app-translation-setup.module";
import { TranslateService } from "@ngx-translate/core";

describe('AbstractReport', () => {

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AbstractReport],
      imports: [TranslationSetupModule],
      providers: [
        provideMockStore({
          initialState: {
            metadata
          }
        })
      ]
    }).compileComponents();
  }));

  it('should create an instance', () => {
    const directive = new AbstractReport(
      TestBed.inject(TranslateService),
      TestBed.inject(MockStore)
    );
    expect(directive).toBeTruthy();
  });
});
