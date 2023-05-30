import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ScenarioEditorComponent } from './scenario-editor.component';
import { SharedModule } from '@src/app/shared/shared.module';
import { SliderControlsComponent } from '../band-selection/slider-controls/slider-controls.component';
import { MatrixSelectionComponent } from './scenario-area-detail/matrix-selection/matrix-selection.component';
import { EcoSliderComponent } from '../band-selection/eco-slider/eco-slider.component';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';
import { StoreModule } from "@ngrx/store";
import { ScenarioListComponent } from "@src/app/map-view/scenario/scenario-list/scenario-list.component";
import { initialState as metadata } from "@data/metadata/metadata.reducers";
import { initialState as area } from "@data/area/area.reducers";
import { initialState as scenario } from "@data/scenario/scenario.reducers";
import { NO_ERRORS_SCHEMA } from "@angular/core";

describe('ScenarioEditorComponent', () => {
  let component: ScenarioEditorComponent;
  let fixture: ComponentFixture<ScenarioEditorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        TranslationSetupModule,
        RouterTestingModule,
        StoreModule.forRoot({},{})
      ],
      declarations: [
        ScenarioEditorComponent,
        SliderControlsComponent,
        EcoSliderComponent,
        MatrixSelectionComponent,
        ScenarioListComponent
      ],
      providers: [
        provideMockStore({
          initialState: {
            user: { baseline: undefined },
            metadata: metadata,
            area: area,
            scenario: scenario
          }})
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
    fixture = TestBed.createComponent(ScenarioEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
