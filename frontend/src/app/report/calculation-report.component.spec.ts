import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculationReportComponent } from './calculation-report.component';
import { SharedModule } from '../shared/shared.module';
import { ImpactTableComponent } from './impact-table/impact-table.component';
import { HighestImpactsComponent } from './highest-impacts/highest-impacts.component';
import { CumulativeEffectEtcComponent } from './cumulative-effect-etc/cumulative-effect-etc.component';
import { provideMockStore } from '@ngrx/store/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { TranslationSetupModule } from '../app-translation-setup.module';
import { PressureChartComponent } from './pressure-chart/pressure-chart.component';
import { initialState as metadata } from '@data/metadata/metadata.reducers';

function setUp() {
  const fixture: ComponentFixture<CalculationReportComponent> = TestBed.createComponent(
    CalculationReportComponent
  );
  const component: CalculationReportComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('CalculationReportComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        CalculationReportComponent,
        ImpactTableComponent,
        HighestImpactsComponent,
        CumulativeEffectEtcComponent,
        PressureChartComponent
      ],
      imports: [SharedModule, RouterTestingModule, HttpClientModule, TranslationSetupModule],
      providers: [
        provideMockStore({
          initialState: {
            metadata
          }
        })
      ]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = setUp();
    expect(component).toBeTruthy();
  });
});
