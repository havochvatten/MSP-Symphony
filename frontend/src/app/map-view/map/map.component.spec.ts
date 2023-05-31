import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { MapComponent } from './map.component';
import { MapToolbarComponent } from './map-toolbar/map-toolbar.component';
import { MapOpacitySliderComponent } from './map-opacity-slider/map-opacity-slider.component';
import { CoreModule } from '@src/app/core/core.module';
import { ToolbarButtonComponent, ToolbarZoomButtonsComponent } from './toolbar-button/toolbar-button.component';
import { SharedModule } from '@shared/shared.module';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';
import { initialState as metadata } from '@data/metadata/metadata.reducers';
import { initialState as area } from '@data/area/area.reducers';
import { initialState as scenario } from '@data/scenario/scenario.reducers';
import { ChangeState, ScenarioLayer } from "@src/app/map-view/map/layers/scenario-layer";
import { BandChange } from "@data/metadata/metadata.interfaces";

describe('MapComponent', () => {
  let fixture: ComponentFixture<MapComponent>,
      component: MapComponent;

  beforeEach(waitForAsync(() => {
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
          metadata: metadata,
          area: area,
          scenario: scenario,
          user: { baseline: undefined }
        }
      })]
    }).compileComponents();
    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
    component.mapCenter = [0,0];
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('classifyBandChanges should classify correctly', () => {
    expect(ScenarioLayer.classifyBandChanges([{ multiplier: 1.2 } as BandChange])).toBe(ChangeState.Red);
    expect(ScenarioLayer.classifyBandChanges([{ multiplier: -1.2 } as BandChange])).toBe(ChangeState.Green);
  })
});
