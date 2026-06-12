import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculationReportComponent } from './calculation-report.component';
import { SharedModule } from '@shared/shared.module';
import { ImpactTableComponent } from './impact-table/impact-table.component';
import { HighestImpactsComponent } from './highest-impacts/highest-impacts.component';
import { CumulativeEffectEtcComponent } from './cumulative-effect-etc/cumulative-effect-etc.component';
import { provideMockStore } from '@ngrx/store/testing';
import { RouterModule } from "@angular/router";
import { TranslationSetupModule } from '../app-translation-setup.module';
import { PressureChartComponent } from './pressure-chart/pressure-chart.component';
import { initialState as metadata } from '@data/metadata/metadata.reducers';
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { provideHttpClient } from "@angular/common/http";
import { provideZonelessChangeDetection } from "@angular/core";

describe('CalculationReportComponent', () => {
  let fixture: ComponentFixture<CalculationReportComponent>,
      component: CalculationReportComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        CalculationReportComponent,
        ImpactTableComponent,
        HighestImpactsComponent,
        CumulativeEffectEtcComponent,
        PressureChartComponent
      ],
      imports: [SharedModule, RouterModule.forRoot([]), TranslationSetupModule, MatProgressSpinnerModule],
      providers: [
        provideHttpClient(),
        provideMockStore({
          initialState: {
            metadata,
            user: {}
          }
        }),
        provideZonelessChangeDetection()
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(CalculationReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
