import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CumulativeEffectEtcComponent } from './cumulative-effect-etc.component';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';

describe('CumulativeEffectEtcComponent', () => {
  let fixture: ComponentFixture<CumulativeEffectEtcComponent>,
      component: CumulativeEffectEtcComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CumulativeEffectEtcComponent],
      imports: [TranslationSetupModule]
    }).compileComponents();
    fixture = TestBed.createComponent(CumulativeEffectEtcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
