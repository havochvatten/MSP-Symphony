import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { HavButtonModule, HavAccordionModule, HavCheckboxModule } from 'hav-components';
import { MainViewComponent } from './main-view.component';
import { SharedModule } from '../shared/shared.module';
import { MapComponent } from './map/map.component';
import { MapToolbarComponent } from './map/map-toolbar/map-toolbar.component';
import { MapOpacitySliderComponent } from './map/map-opacity-slider/map-opacity-slider.component';
import { CoreModule } from '../core/core.module';
import { SliderControlsComponent } from './band-selection/slider-controls/slider-controls.component';
import { MatrixSelectionComponent } from './scenario/scenario-detail/matrix-selection/matrix-selection.component';
import {
  ToolbarZoomButtonsComponent,
  ToolbarButtonComponent
} from './map/toolbar-button/toolbar-button.component';
import { EcoSliderComponent } from './band-selection/eco-slider/eco-slider.component';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';
import { AreaSelectionComponent } from './area-selection/area-selection.component';
import { BandSelectionComponent } from './band-selection/band-selection.component';
import { SelectionLayoutComponent } from './selection-layout/selection-layout.component';
import { initialState as metadata } from '@data/metadata/metadata.reducers';
import { ScenarioEditorComponent } from "@src/app/map-view/scenario/scenario-editor.component";

function setUp() {
  const fixture: ComponentFixture<MainViewComponent> = TestBed.createComponent(MainViewComponent);
  const component: MainViewComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('MapViewComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        CoreModule,
        HavButtonModule,
        HavAccordionModule,
        TranslationSetupModule,
        RouterTestingModule,
        HavCheckboxModule
      ],
      declarations: [
        MainViewComponent,
        MapComponent,
        ScenarioEditorComponent,
        MapToolbarComponent,
        MapOpacitySliderComponent,
        SliderControlsComponent,
        MatrixSelectionComponent,
        ToolbarZoomButtonsComponent,
        ToolbarButtonComponent,
        EcoSliderComponent,
        AreaSelectionComponent,
        BandSelectionComponent,
        SelectionLayoutComponent
      ],
      providers: [provideMockStore({
        initialState: {
          metadata
        }
      })]
    }).compileComponents();
  }));

  /*it('should create', () => {
    const { component } = setUp();
    expect(component).toBeTruthy();
  });*/
});
