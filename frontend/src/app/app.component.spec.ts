import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { TranslationSetupModule } from './app-translation-setup.module';
import { SharedModule } from '@shared/shared.module';
import { provideMockStore } from '@ngrx/store/testing';
import { RouterModule } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';

describe('AppComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, RouterModule.forRoot([]), CoreModule, TranslationSetupModule],
      declarations: [AppComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideMockStore({
          initialState: {
            user: {
              loading: false,
              loadingBaseline: false,
              redirectUrl: '/map'
            },
            area: { loading: false },
            calculation: {
              loadingCompoundComparisons: false,
              loadingLegends: false
            },
            metadata: { loading: false }
          }
        })
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });
});
