import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslateService } from '@ngx-translate/core';
import { TranslateSpecModule } from '@src/testing/translate-spec.module';
import { ActiveScenarioDisplayComponent } from './active-scenario-display.component';
import { NormalizationType } from '@data/calculation/calculation.service';
import { provideZonelessChangeDetection } from '@angular/core';

describe('ActiveScenarioDisplayComponent', () => {
  let component: ActiveScenarioDisplayComponent;
  let fixture: ComponentFixture<ActiveScenarioDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateSpecModule],
      providers: [TranslateService, provideZonelessChangeDetection()],
      declarations: [ActiveScenarioDisplayComponent]
    }).compileComponents();

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
      name: '',
      normalization: { type: NormalizationType.DOMAIN },
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
