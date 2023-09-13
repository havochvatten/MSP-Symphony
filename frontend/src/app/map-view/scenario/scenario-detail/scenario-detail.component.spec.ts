import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ScenarioDetailComponent } from './scenario-detail.component';
import { StoreModule } from "@ngrx/store";
import { HttpClientModule } from "@angular/common/http";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { NormalizationType } from "@data/calculation/calculation.service";
import { MatLegacyRadioModule as MatRadioModule } from "@angular/material/legacy-radio";
import { IconComponent } from "@shared/icon/icon.component";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState as metadata } from "@data/metadata/metadata.reducers";
import { initialState as scenario } from "@data/scenario/scenario.reducers";
import { initialState as calculation } from "@data/calculation/calculation.reducers";
import { initialState as area } from "@data/area/area.reducers";
import {
  MatrixSelectionComponent
} from "@src/app/map-view/scenario/scenario-area-detail/matrix-selection/matrix-selection.component";
import {
  NormalizationSelectionComponent
} from "@src/app/map-view/scenario/scenario-detail/normalization-selection/normalization-selection.component";
import { AddScenarioAreasComponent } from "@src/app/map-view/scenario/add-scenario-areas/add-scenario-areas.component";
import { OrdinalPipe } from "@shared/ordinal.pipe";
import { ChangesListComponent } from "@src/app/map-view/scenario/scenario-detail/changes-list/changes-list.component";

describe('ScenarioDetailComponent', () => {
  let component: ScenarioDetailComponent;
  let fixture: ComponentFixture<ScenarioDetailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        StoreModule.forRoot({}, {}),
        TranslateModule.forRoot(),
        MatRadioModule
      ],
      providers: [
        TranslateService,
        OrdinalPipe,
        provideMockStore(
          { initialState: {
              metadata: metadata,
              scenario: scenario,
              calculation: calculation,
              area: area,
              user: { baseline: undefined }
            }})
      ],
      declarations: [
        ScenarioDetailComponent,
        MatrixSelectionComponent,
        NormalizationSelectionComponent,
        AddScenarioAreasComponent,
        ChangesListComponent,
        OrdinalPipe,
        IconComponent
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(ScenarioDetailComponent);
    component = fixture.componentInstance;
    component.scenario = {
      operation: 0,
      operationOptions: {},
      id: -1,
      timestamp: 0,
      baselineId: 0,
      changes: {},
      ecosystemsToInclude: [],
      name: "",
      normalization: { type:NormalizationType.Domain },
      pressuresToInclude: [],
      areas: [],
      latestCalculationId: null
    };
    component.ngOnInit();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
