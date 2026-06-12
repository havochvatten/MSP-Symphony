import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CumulativeEffectEtcComponent } from './cumulative-effect-etc.component';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';
import { provideMockStore } from "@ngrx/store/testing";
import { provideZonelessChangeDetection } from "@angular/core";

describe('CumulativeEffectEtcComponent', () => {
  let fixture: ComponentFixture<CumulativeEffectEtcComponent>,
      component: CumulativeEffectEtcComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CumulativeEffectEtcComponent],
      imports: [TranslationSetupModule],
      providers: [
        provideMockStore({ initialState : { user: {} } }),
        provideZonelessChangeDetection()
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(CumulativeEffectEtcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
