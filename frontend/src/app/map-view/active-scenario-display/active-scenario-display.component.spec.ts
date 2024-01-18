import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { ActiveScenarioDisplayComponent } from './active-scenario-display.component';
import { NormalizationType } from "@data/calculation/calculation.service";

describe('ActiveScenarioDisplayComponent', () => {
  let component: ActiveScenarioDisplayComponent;
  let fixture: ComponentFixture<ActiveScenarioDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ TranslateModule.forRoot() ],
      providers: [ TranslateService ],
      declarations: [ ActiveScenarioDisplayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveScenarioDisplayComponent);
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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
