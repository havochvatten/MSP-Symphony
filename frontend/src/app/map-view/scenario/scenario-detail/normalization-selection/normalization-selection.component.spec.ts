import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NormalizationSelectionComponent } from './normalization-selection.component';
import { HavButtonModule, HavRadioButtonModule } from 'hav-components';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';

function setUp() {
  const fixture: ComponentFixture<NormalizationSelectionComponent> = TestBed.createComponent(
    NormalizationSelectionComponent
  );
  const component: NormalizationSelectionComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('NormalizationSelectionComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HavButtonModule, HavRadioButtonModule, TranslationSetupModule],
      declarations: [NormalizationSelectionComponent]
    }).compileComponents();
  }));

  /*it('should create', () => {
    const { component } = setUp();
    expect(component).toBeTruthy();
  });*/
});
