import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { MainViewComponent } from './main-view.component';
import { SharedModule } from '../shared/shared.module';
import { MapComponent } from './map/map.component';
import { MapToolbarComponent } from './map/map-toolbar/map-toolbar.component';
import { MapOpacitySliderComponent } from './map/map-opacity-slider/map-opacity-slider.component';
import { CoreModule } from '../core/core.module';
import { SliderControlsComponent } from './band-selection/slider-controls/slider-controls.component';
import { MatrixSelectionComponent } from './scenario/scenario-area-detail/matrix-selection/matrix-selection.component';
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
import { initialState as area } from '@data/area/area.reducers';
import { initialState as calculation } from '@data/calculation/calculation.reducers';
import { initialState as scenario } from '@data/scenario/scenario.reducers';
import { ScenarioEditorComponent } from "@src/app/map-view/scenario/scenario-editor.component";
import { StoreModule } from "@ngrx/store";
import { CalculationHistoryComponent } from "@src/app/map-view/calculation-history/calculation-history.component";
import { ComparisonComponent } from "@src/app/map-view/comparison/comparison.component";
import { FormBuilder } from "@angular/forms";
import { MatLegacySelectModule as MatSelectModule } from "@angular/material/legacy-select";
import { AreaGroupComponent } from "@src/app/map-view/area-selection/area-group/area-group.component";
import { ScenarioListComponent } from "@src/app/map-view/scenario/scenario-list/scenario-list.component";

describe('MainViewComponent', () => {
  let fixture: ComponentFixture<MainViewComponent>,
      component: MainViewComponent;

  beforeEach((() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        CoreModule,
        TranslationSetupModule,
        RouterTestingModule,
        MatSelectModule,
        StoreModule.forRoot({},{}),
      ],
      declarations: [
        MainViewComponent,
        MapComponent,
        ScenarioEditorComponent,
        ScenarioListComponent,
        MapToolbarComponent,
        MapOpacitySliderComponent,
        SliderControlsComponent,
        MatrixSelectionComponent,
        ToolbarZoomButtonsComponent,
        ToolbarButtonComponent,
        EcoSliderComponent,
        AreaGroupComponent,
        AreaSelectionComponent,
        BandSelectionComponent,
        SelectionLayoutComponent,
        CalculationHistoryComponent,
        ComparisonComponent
      ],
      providers: [
        FormBuilder,
        provideMockStore({
        initialState: {
            user: { baseline: undefined },
            metadata: metadata,
            calculation: calculation,
            area: area,
            scenario: scenario
        }})]
    }).compileComponents();
    fixture = TestBed.createComponent(MainViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
