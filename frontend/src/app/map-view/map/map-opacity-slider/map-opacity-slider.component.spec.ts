import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MapOpacitySliderComponent } from './map-opacity-slider.component';
import { SharedModule } from '@shared/shared.module';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';
import { provideMockStore } from "@ngrx/store/testing";

describe('MapOpacitySliderComponent', () => {
  let fixture: ComponentFixture<MapOpacitySliderComponent>,
      component: MapOpacitySliderComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        TranslationSetupModule
      ],
      declarations: [MapOpacitySliderComponent],
      providers: [provideMockStore({ initialState : { user: {} } })]
    })
    .compileComponents();
    fixture = TestBed.createComponent(MapOpacitySliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
