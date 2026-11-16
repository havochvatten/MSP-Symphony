import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculationReportComponent } from './calculation-report.component';
import { SharedModule } from '@shared/shared.module';
import { ImpactTableComponent } from './impact-table/impact-table.component';
import { HighestImpactsComponent } from './highest-impacts/highest-impacts.component';
import { CumulativeEffectEtcComponent } from './cumulative-effect-etc/cumulative-effect-etc.component';
import { provideMockStore } from '@ngrx/store/testing';
import { RouterModule } from '@angular/router';
import { TranslationSetupModule } from '../app-translation-setup.module';
import { PressureChartComponent } from './pressure-chart/pressure-chart.component';
import { ReportLogosComponent } from './report-logos/report-logos.component';
import { initialState as metadata } from '@data/metadata/metadata.reducers';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';
import { CalculationService } from '@data/calculation/calculation.service';
import { Legend } from '@data/calculation/calculation.interfaces';

describe('CalculationReportComponent', () => {
  let fixture: ComponentFixture<CalculationReportComponent>, component: CalculationReportComponent;

  const servedLegend: Legend = { unit: '%', colorMap: [{ color: '#123456', quantity: 1 }] };
  let getLegend: jasmine.Spy;

  beforeEach(() => {
    getLegend = jasmine.createSpy('getLegend').and.returnValue(of(servedLegend));
    TestBed.configureTestingModule({
      declarations: [
        CalculationReportComponent,
        ImpactTableComponent,
        HighestImpactsComponent,
        CumulativeEffectEtcComponent,
        PressureChartComponent,
        ReportLogosComponent
      ],
      imports: [
        SharedModule,
        RouterModule.forRoot([]),
        TranslationSetupModule,
        MatProgressSpinnerModule
      ],
      providers: [
        provideHttpClient(),
        provideMockStore({
          initialState: {
            metadata,
            user: {}
          }
        }),
        provideZonelessChangeDetection(),
        { provide: CalculationService, useValue: { getLegend } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(CalculationReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('takes the report legend and impact bar colours from the served result legend', (done) => {
    expect(getLegend).toHaveBeenCalledWith('result');
    component.resultLegend$.subscribe((legend) => {
      expect(legend).toBe(servedLegend);
      done();
    });
  });
});
