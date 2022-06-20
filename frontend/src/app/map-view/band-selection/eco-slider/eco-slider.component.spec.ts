import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { EcoSliderComponent } from './eco-slider.component';
import { SharedModule } from '@src/app/shared/shared.module';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';
import { provideMockStore } from '@ngrx/store/testing';
import { initialState } from '@data/metadata/metadata.reducers';

function setUp() {
  const fixture: ComponentFixture<EcoSliderComponent> = TestBed.createComponent(EcoSliderComponent);
  const component: EcoSliderComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('EcoSliderComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        TranslationSetupModule,
        RouterTestingModule
      ],
      declarations: [EcoSliderComponent],
      providers: [provideMockStore({ initialState: {
        metadata: initialState
      }})]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = setUp();
    expect(component).toBeTruthy();
  });
});
