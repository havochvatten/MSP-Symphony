import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CumulativeEffectEtcComponent } from './cumulative-effect-etc.component';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';

function setUp() {
  const fixture: ComponentFixture<CumulativeEffectEtcComponent> = TestBed.createComponent(
    CumulativeEffectEtcComponent
  );
  const component: CumulativeEffectEtcComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('CumulativeEffectEtcComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CumulativeEffectEtcComponent],
      imports: [TranslationSetupModule]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = setUp();
    expect(component).toBeTruthy();
  });
});
