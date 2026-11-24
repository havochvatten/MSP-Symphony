import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NormalizationSelectionComponent } from './normalization-selection.component';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';
import { OrdinalPipe } from '@shared/ordinal.pipe';
import { MatRadioModule } from '@angular/material/radio';
import { provideMockStore } from '@ngrx/store/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NormalizationType } from '@data/calculation/calculation.service';

describe('NormalizationSelectionComponent', () => {
  let component: NormalizationSelectionComponent;
  let fixture: ComponentFixture<NormalizationSelectionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslationSetupModule, MatRadioModule],
      providers: [
        OrdinalPipe,
        provideMockStore({ initialState: { user: {} } }),
        provideZonelessChangeDetection()
      ],
      declarations: [NormalizationSelectionComponent, OrdinalPipe]
    }).compileComponents();
    fixture = TestBed.createComponent(NormalizationSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('formats with the new locale after a language switch', async () => {
    const translate = TestBed.inject(TranslateService);
    await translate.use('sv');

    const switchedFixture = TestBed.createComponent(NormalizationSelectionComponent);
    switchedFixture.componentInstance.options = {
      type: NormalizationType.DOMAIN,
      stdDevMultiplier: 0,
      userDefinedValue: 1
    };
    switchedFixture.componentInstance.percentileValue = 90;
    await switchedFixture.whenStable();
    const domainLabel = () =>
      // the labels are AREA, DOMAIN, STANDARD_DEVIATION, USER_DEFINED, in that order
      switchedFixture.nativeElement
        .querySelectorAll('.normalization-label-text')[1]
        .textContent.trim();
    expect(switchedFixture.componentInstance['locale']()).toBe('sv');
    expect(domainLabel()).toContain('90e ');

    await translate.use('en');
    await switchedFixture.whenStable();

    expect(switchedFixture.componentInstance['locale']()).toBe('en');
    expect(domainLabel()).toContain('90th ');
  });
});
