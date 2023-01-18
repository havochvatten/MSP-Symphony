import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MapOpacitySliderComponent } from './map-opacity-slider.component';
import { SharedModule } from '@src/app/shared/shared.module';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';

function setUp() {
  const fixture: ComponentFixture<MapOpacitySliderComponent> = TestBed.createComponent(MapOpacitySliderComponent);
  const component: MapOpacitySliderComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('MapOpacitySliderComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        TranslationSetupModule
      ],
      declarations: [MapOpacitySliderComponent]
    })
    .compileComponents();
  }));

  it('should create', () => {
    const { component } = setUp();
    expect(component).toBeTruthy();
  });
});
