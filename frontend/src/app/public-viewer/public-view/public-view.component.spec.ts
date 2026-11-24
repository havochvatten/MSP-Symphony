import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { ReplaySubject } from 'rxjs';
import { Action } from '@ngrx/store';
import { Router } from '@angular/router';

import { PublicView } from './public-view.component';
import { UserActions } from '@data/user';
import { SharedModule } from '@shared/shared.module';
import { MapComponent } from '../../map-view/map/map.component';
import { MapToolbarComponent } from '../../map-view/map/map-toolbar/map-toolbar.component';
import { MapOpacitySliderComponent } from '../../map-view/map/map-opacity-slider/map-opacity-slider.component';
import { CoreModule } from '../../core/core.module';
import { SliderControlsComponent } from '../../map-view/band-selection/slider-controls/slider-controls.component';
import { MatrixSelectionComponent } from '../../map-view/scenario/scenario-area-detail/matrix-selection/matrix-selection.component';
import {
  ToolbarZoomButtonsComponent,
  ToolbarButtonComponent
} from '../../map-view/map/toolbar-button/toolbar-button.component';
import { EcoSliderComponent } from '../../map-view/band-selection/eco-slider/eco-slider.component';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';
import { AreaSelectionComponent } from '../../map-view/area-selection/area-selection.component';
import { BandSelectionComponent } from '../../map-view/band-selection/band-selection.component';
import { SelectionLayoutComponent } from '../../map-view/selection-layout/selection-layout.component';
import { initialState as metadata } from '@data/metadata/metadata.reducers';
import { initialState as area } from '@data/area/area.reducers';
import { initialState as calculation } from '@data/calculation/calculation.reducers';
import { initialState as scenario } from '@data/scenario/scenario.reducers';
import {
  initialState as config,
  configReducer
} from '@data/systemproperties/systemproperties.reducer';
import { ScenarioEditorComponent } from '@src/app/map-view/scenario/scenario-editor.component';
import { StoreModule } from '@ngrx/store';
import { CalculationHistoryComponent } from '@src/app/map-view/calculation-history/calculation-history.component';
import { ComparisonComponent } from '@src/app/map-view/comparison/comparison.component';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { AreaGroupComponent } from '@src/app/map-view/area-selection/area-group/area-group.component';
import { ScenarioListComponent } from '@src/app/map-view/scenario/scenario-list/scenario-list.component';
import { BatchProgressComponent } from '../../map-view/batch-progress-display/batch-progress.component';
import { RouterModule } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AddScenarioAreasComponent } from '@src/app/map-view/scenario/add-scenario-areas/add-scenario-areas.component';
import { SummaryModelSelectionComponent } from '../../map-view/band-selection/summary-model-selection/summary-model-selection.component';
import { SummaryModelAccordionComponent } from '../../map-view/band-selection/summary-model-selection/summary-model-accordion/summary-model-accordion.component';
import { SummaryModelControlsComponent } from '../../map-view/band-selection/summary-model-selection/summary-model-controls/summary-model-controls.component';

describe('PublicView', () => {
  let component: PublicView;
  let fixture: ComponentFixture<PublicView>;
  let store: MockStore;
  let actions$: ReplaySubject<Action>;

  beforeEach(async () => {
    actions$ = new ReplaySubject<Action>(1);

    await TestBed.configureTestingModule({
      imports: [
        SharedModule,
        CoreModule,
        TranslationSetupModule,
        RouterModule.forRoot([]),
        MatSelectModule,
        MatRadioModule,
        MatCheckboxModule,
        StoreModule.forRoot({}, {}),
        StoreModule.forFeature('config', configReducer)
      ],
      declarations: [
        PublicView,
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
        SummaryModelSelectionComponent,
        SummaryModelAccordionComponent,
        SummaryModelControlsComponent,
        BandSelectionComponent,
        SelectionLayoutComponent,
        CalculationHistoryComponent,
        ComparisonComponent,
        BatchProgressComponent,
        AddScenarioAreasComponent
      ],
      providers: [
        provideMockStore({
          initialState: {
            user: { baseline: undefined },
            metadata: metadata,
            calculation: calculation,
            area: area,
            scenario: scenario,
            config: config
          }
        }),
        provideMockActions(() => actions$),
        provideZonelessChangeDetection()
      ]
    }).compileComponents();

    store = TestBed.inject(MockStore);
  });

  it('should create', () => {
    fixture = TestBed.createComponent(PublicView);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('redirects a logged-in visitor to /map and does not create a public user', () => {
    const navigateSpy = spyOn(TestBed.inject(Router), 'navigate');
    const dispatchSpy = spyOn(store, 'dispatch');

    // PublicGuard's fetchUser() resolves to a logged-in user.
    actions$.next(UserActions.fetchUserSuccess({ user: { username: 'real-user' } }));

    fixture = TestBed.createComponent(PublicView);

    expect(navigateSpy).toHaveBeenCalledWith(['/map']);
    expect(dispatchSpy).not.toHaveBeenCalledWith(UserActions.createPublicUser());
  });

  it('creates a public user for an anonymous visitor and does not redirect', () => {
    const navigateSpy = spyOn(TestBed.inject(Router), 'navigate');
    const dispatchSpy = spyOn(store, 'dispatch');

    // PublicGuard's fetchUser() fails (401) for an anonymous visitor.
    actions$.next(
      UserActions.fetchUserFailure({ error: { status: 401, message: 'Unauthorized' } })
    );

    fixture = TestBed.createComponent(PublicView);

    expect(dispatchSpy).toHaveBeenCalledWith(UserActions.createPublicUser());
    expect(navigateSpy).not.toHaveBeenCalled();
  });
});
