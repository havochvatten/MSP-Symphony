import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CalculationReportComponent } from './calculation-report.component';
import { SharedModule } from '@shared/shared.module';
import { ImpactTableComponent } from './impact-table/impact-table.component';
import { HighestImpactsComponent } from './highest-impacts/highest-impacts.component';
import { CumulativeEffectEtcComponent } from './cumulative-effect-etc/cumulative-effect-etc.component';
import { provideMockStore } from '@ngrx/store/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { TranslationSetupModule } from '../app-translation-setup.module';
import { PressureChartComponent } from './pressure-chart/pressure-chart.component';
import { initialState as metadata } from '@data/metadata/metadata.reducers';
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

describe('CalculationReportComponent', () => {
  let fixture: ComponentFixture<CalculationReportComponent>,
      component: CalculationReportComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        CalculationReportComponent,
        ImpactTableComponent,
        HighestImpactsComponent,
        CumulativeEffectEtcComponent,
        PressureChartComponent
      ],
      imports: [SharedModule, RouterTestingModule, HttpClientModule, TranslationSetupModule, MatProgressSpinnerModule],
      providers: [
        provideMockStore({
          initialState: {
            metadata,
            user: {}
          }
        })
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(CalculationReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
