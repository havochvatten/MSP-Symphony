import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { ScenarioEditorComponent } from './scenario-editor.component';
import { SharedModule } from '@shared/shared.module';
import { SliderControlsComponent } from '../band-selection/slider-controls/slider-controls.component';
import { MatrixSelectionComponent } from './scenario-area-detail/matrix-selection/matrix-selection.component';
import { EcoSliderComponent } from '../band-selection/eco-slider/eco-slider.component';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';
import { StoreModule } from "@ngrx/store";
import { ScenarioListComponent } from "@src/app/map-view/scenario/scenario-list/scenario-list.component";
import { initialState as metadata } from "@data/metadata/metadata.reducers";
import { initialState as area } from "@data/area/area.reducers";
import { initialState as scenario } from "@data/scenario/scenario.reducers";
import { provideZonelessChangeDetection } from "@angular/core";
import { RouterModule } from "@angular/router";
import { AddScenarioAreasComponent } from "@src/app/map-view/scenario/add-scenario-areas/add-scenario-areas.component";

describe('ScenarioEditorComponent', () => {
  let component: ScenarioEditorComponent;
  let fixture: ComponentFixture<ScenarioEditorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        TranslationSetupModule,
        RouterModule.forRoot([]),
        StoreModule.forRoot({},{})
      ],
      declarations: [
        ScenarioEditorComponent,
        SliderControlsComponent,
        EcoSliderComponent,
        MatrixSelectionComponent,
        ScenarioListComponent,
        AddScenarioAreasComponent
      ],
      providers: [
        provideMockStore({
          initialState: {
            user: { baseline: undefined },
            metadata: metadata,
            area: area,
            scenario: scenario
          }}),
        provideZonelessChangeDetection()
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ScenarioEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
