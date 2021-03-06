import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { HavAccordionModule } from 'hav-components';
import { SliderControlsComponent } from './slider-controls.component';
import { EcoSliderComponent } from '../eco-slider/eco-slider.component';
import { SharedModule } from '@src/app/shared/shared.module';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';

function setUp() {
  const fixture: ComponentFixture<SliderControlsComponent> = TestBed.createComponent(SliderControlsComponent);
  const component: SliderControlsComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('SliderControlsComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        HavAccordionModule,
        TranslationSetupModule
      ],
      declarations: [SliderControlsComponent, EcoSliderComponent],
      providers: [provideMockStore()]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = setUp();
    expect(component).toBeTruthy();
  });
});
