import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { formatPercent } from "@angular/common";
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { State } from '../app-reducer';
import { MetadataActions } from '@data/metadata';
import { ComparisonReport, Legend } from '@data/calculation/calculation.interfaces';
import { environment as env } from "@src/environments/environment";
import { ReportService } from "@src/app/report/report.service";
import { CalculationService } from "@data/calculation/calculation.service";
import { relativeDifference } from "@src/app/report/report.util";
import { AbstractReport } from "@src/app/report/abstract-report.component";
import { BrandingService } from '@src/app/core/branding/branding.service';

@Component({
  selector: 'app-calculation-report',
  templateUrl: './comparison-report.component.html',
  styleUrls: ['./report.component.scss'],
  standalone: false,
})
export class ComparisonReportComponent extends AbstractReport<ComparisonReport> {
  public brandingService = inject(BrandingService);
  private readonly store: Store<State>;

  area?: number;

  now = new Date();
  areaDictA: Map<number, string> = new Map<number, string>();
  areaDictB: Map<number, string> = new Map<number, string>();

  maxValue: number;
  reverse: boolean;

  chartWeightThresholdPercentage = '1%';

  legend: Observable<Legend>;

  constructor() {
    const store = inject<Store<State>>(Store);
    const route = inject(ActivatedRoute);
    const reportService = inject(ReportService);
    const calcService = inject(CalculationService);

    super();
    this.store = store;

    const paramMap = route.snapshot.paramMap,
      aId = paramMap.get('aId')!,
      bId = paramMap.get('bId');

    this.maxValue = +(paramMap.get('maxValue') || 0);

    this.reverse =
      Object.keys(route.snapshot.queryParams).includes('reverse') &&
      route.snapshot.queryParams.reverse !== 'false';

    this.legend = calcService.getComparisonLegend(this.maxValue / 100);

    this.imageUrl = bId
      ? `${env.apiBaseUrl}/calculation/diff/${aId}/${bId}?max=${this.maxValue}`
      : `${env.apiBaseUrl}/calculation/diff/${aId}?max=${this.maxValue}${this.reverse ? '&reverse=true' : ''}`;

    reportService.getComparisonReport(aId, bId, this.reverse).subscribe({
      next: (report) => {
        this.reportSignal.set(report);
        this.report().a = report.a;
        this.report().b = report.b;
        this.area = reportService.calculateArea(report.a);
        this.loadingReport = false;

        this.store.dispatch(
          MetadataActions.fetchMetadataForBaseline({ baselineName: report.a.baselineName }),
        );
        this.areaDictA = reportService.setAreaDict(report.a);
        this.areaDictB = reportService.setAreaDict(report.b);

        this.chartWeightThresholdPercentage = formatPercent(
          report.a.chartWeightThreshold,
          this.locale,
        );
      },
      error: () => {
        this.loadingReport = false;
      },
    });
  }

  getChartThresholdPercentage(): string {
    return this.chartWeightThresholdPercentage;
  }

  // Compute relative difference with regard to first scenario element in components
  calculateRelativeDifference(components: Record<string, number>[]) {
    // Would be nicer written as an Immutable.js map operation
    const diffs: Record<string, number> = {};
    const unionOfBandKeys = new Set([...Object.keys(components[0]), ...Object.keys(components[1])]);
    unionOfBandKeys.forEach((band) => {
      const [a, b] = components.map((item) => item[band]);
      diffs[band] = relativeDifference(a, b);
    });
    return diffs;
  }
}
