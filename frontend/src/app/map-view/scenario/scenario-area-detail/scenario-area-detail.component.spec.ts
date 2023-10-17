import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreModule } from "@ngrx/store";
import { provideMockStore } from "@ngrx/store/testing";
import { HttpClientModule } from "@angular/common/http";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { OrdinalPipe } from "@shared/ordinal.pipe";
import { NormalizationType } from "@data/calculation/calculation.service";
import { ScenarioAreaDetailComponent } from './scenario-area-detail.component';
import { IconComponent } from "@shared/icon/icon.component";
import { ChangesListComponent } from "@src/app/map-view/scenario/scenario-detail/changes-list/changes-list.component";
import {
  MatrixSelectionComponent
} from "@src/app/map-view/scenario/scenario-area-detail/matrix-selection/matrix-selection.component";
describe('ScenarioAreaDetailComponent', () => {
  let component: ScenarioAreaDetailComponent;
  let fixture: ComponentFixture<ScenarioAreaDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ StoreModule.forRoot({},{}), HttpClientModule, TranslateModule.forRoot() ],
      declarations: [ ScenarioAreaDetailComponent, OrdinalPipe,
                      IconComponent, ChangesListComponent, MatrixSelectionComponent ],
      providers: [ OrdinalPipe, TranslateService,  provideMockStore({}) ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScenarioAreaDetailComponent);
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
      areas: [{
        id: 1,
        feature: {type:'Feature', geometry: {type: 'Polygon', coordinates:[]}, properties: { feature: { name: ''} }},
        changes: {},
        matrix: {matrixType: 'STANDARD'},
        scenarioId: -1,
        excludedCoastal: null
      }],
      latestCalculationId: null
    };
    component.areaIndex = 0;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
