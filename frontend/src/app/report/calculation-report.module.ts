import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

import { CalculationReportRoutingModule } from './calculation-report-routing.module';
import { CalculationReportComponent } from './calculation-report.component';
import { PressureChartComponent } from './pressure-chart/pressure-chart.component';
import { CumulativeEffectEtcComponent } from './cumulative-effect-etc/cumulative-effect-etc.component';
import { ImpactTableComponent } from './impact-table/impact-table.component';
import { SharedModule } from '@shared/shared.module';
import { HighestImpactsComponent } from './highest-impacts/highest-impacts.component';
import { CalculationImageComponent } from './calculation-image/calculation-image.component';
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { ScenarioChangesComponent } from './scenario-changes/scenario-changes.component';
import { ComparisonReportComponent } from "@src/app/report/comparison-report.component";
import { OrdinalPipe } from "@shared/ordinal.pipe";
import { HistogramComponent } from './histogram/histogram.component';
import { HistogramChartComponent } from './histogram/histogram-chart/histogram-chart.component';
import { ReportBottomComponent } from './report-bottom/report-bottom.component';
import { AbstractReport } from './abstract-report.directive';

@NgModule({
  declarations: [
    CalculationReportComponent,
    ComparisonReportComponent,
    PressureChartComponent,
    CumulativeEffectEtcComponent,
    ImpactTableComponent,
    HighestImpactsComponent,
    CalculationImageComponent,
    ScenarioChangesComponent,
    HistogramComponent,
    HistogramChartComponent,
    AbstractReport,
    ReportBottomComponent
  ],
  imports: [CommonModule, SharedModule, CalculationReportRoutingModule, MatProgressSpinnerModule],
  providers: [DecimalPipe, OrdinalPipe]
})
export class CalculationReportModule {}
