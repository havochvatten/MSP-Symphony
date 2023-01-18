import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ScenarioEditorComponent } from './scenario-editor.component';
import { SharedModule } from '@src/app/shared/shared.module';
import { SliderControlsComponent } from '../band-selection/slider-controls/slider-controls.component';
import { MatrixSelectionComponent } from './scenario-detail/matrix-selection/matrix-selection.component';
import { EcoSliderComponent } from '../band-selection/eco-slider/eco-slider.component';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';
import { initialState } from '@data/metadata/metadata.reducers';

function setUp() {
  const fixture: ComponentFixture<ScenarioEditorComponent> = TestBed.createComponent(ScenarioEditorComponent);
  const component: ScenarioEditorComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('EcoEditorComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        TranslationSetupModule,
        RouterTestingModule
      ],
      declarations: [
        ScenarioEditorComponent,
        SliderControlsComponent,
        EcoSliderComponent,
        MatrixSelectionComponent
      ],
      providers: [provideMockStore({
        initialState: {
          metadata: initialState
        }
      })]
    }).compileComponents();
  }));

  // it('should create', () => {
  //   const { component } = setUp();
  //   expect(component).toBeTruthy();
  // });
});
