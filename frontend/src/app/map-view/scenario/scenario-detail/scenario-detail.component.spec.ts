import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ScenarioDetailComponent } from './scenario-detail.component';
import { StoreModule } from "@ngrx/store";
import { HttpClientModule } from "@angular/common/http";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { NormalizationType } from "@data/calculation/calculation.service";
import { MatRadioModule } from "@angular/material/radio";
import { IconComponent } from "@shared/icon/icon.component";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState as metadata } from "@data/metadata/metadata.reducers";
import { initialState as scenario } from "@data/scenario/scenario.reducers";
import { initialState as calculation } from "@data/calculation/calculation.reducers";
import { initialState as area } from "@data/area/area.reducers";
import {
  MatrixSelectionComponent
} from "@src/app/map-view/scenario/scenario-detail/matrix-selection/matrix-selection.component";
import {
  NormalizationSelectionComponent
} from "@src/app/map-view/scenario/scenario-detail/normalization-selection/normalization-selection.component";
import { OrdinalPipe } from "@shared/ordinal.pipe";

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
        OrdinalPipe,
        IconComponent
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(ScenarioDetailComponent);
    component = fixture.componentInstance;
    component.scenario = {
      baselineId: 0,
      changes: {type: 'FeatureCollection', features: []},
      ecosystemsToInclude: [],
      feature: { type:'Feature', geometry:{ type:'Point', coordinates:[] }, properties: {} },
      id: "",
      latestCalculation: "",
      matrix: {},
      name: "",
      normalization: { type:NormalizationType.Domain },
      pressuresToInclude: [],
      timestamp: 0
    };
    component.ngOnInit();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
