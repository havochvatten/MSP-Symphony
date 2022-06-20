import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { MapComponent } from './map.component';
import { MapToolbarComponent } from './map-toolbar/map-toolbar.component';
import { MapOpacitySliderComponent } from './map-opacity-slider/map-opacity-slider.component';
import { CoreModule } from '@src/app/core/core.module';
import { ToolbarButtonComponent, ToolbarZoomButtonsComponent } from './toolbar-button/toolbar-button.component';
import { SharedModule } from '@src/app/shared/shared.module';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';
import { initialState as metadata } from '@data/metadata/metadata.reducers';
import { initialState as area } from '@data/area/area.reducers';
import { ChangeState, ScenarioLayer } from "@src/app/map-view/map/layers/scenario-layer";
import { BandChange } from "@data/metadata/metadata.interfaces";

function setUp() {
  const fixture: ComponentFixture<MapComponent> = TestBed.createComponent(MapComponent);
  const component: MapComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('MapComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        CoreModule,
        TranslationSetupModule
      ],
      declarations: [
        MapComponent,
        MapToolbarComponent,
        MapOpacitySliderComponent,
        ToolbarZoomButtonsComponent,
        ToolbarButtonComponent
      ],
      providers: [provideMockStore({
        initialState: {
          metadata,
          area
        }
      })]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = setUp();
    expect(component).toBeTruthy();
  });

  it('classifyBandChanges should classify correctly', () => {
    expect(ScenarioLayer.classifyBandChanges([{ multiplier: 1.2 } as BandChange])).toBe(ChangeState.Red);
    expect(ScenarioLayer.classifyBandChanges([{ multiplier: 1.2 } as BandChange])).toBe(ChangeState.Green);
  })
});
