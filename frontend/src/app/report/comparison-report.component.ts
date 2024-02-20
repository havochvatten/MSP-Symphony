import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { map } from "lodash";
import { State } from '../app-reducer';
import { MetadataActions } from '@data/metadata';
import { ComparisonReport, Legend } from '@data/calculation/calculation.interfaces';
import { environment as env } from "@src/environments/environment";
import { ReportService } from "@src/app/report/report.service";
import { CalculationService } from "@data/calculation/calculation.service";
import { relativeDifference, setOverflowProperty } from "@src/app/report/report.util";
import { AbstractReport } from "@src/app/report/abstract-report.directive";
import { formatPercent } from "@angular/common";

@Component({
  selector: 'app-calculation-report',
  templateUrl: './comparison-report.component.html',
  styleUrls: ['./report.component.scss'],
})
export class ComparisonReportComponent extends AbstractReport {
  report?: ComparisonReport;
  area?: number;

  now = new Date();
  areaDictA: Map<number, string> = new Map<number, string>();
  areaDictB: Map<number, string> = new Map<number, string>();

  allOverflow: { [bandType: string]: number[] } = {};

  maxValue: number;
  reverse: boolean;

  chartWeightThresholdPercentage = '1%';

  legend:Observable<Legend>;

  constructor(
    translate: TranslateService,
    private store: Store<State>,
    route: ActivatedRoute,
    reportService: ReportService,
    calcService: CalculationService
  ) {
    super(
      translate,
      store
    );

    const that = this,
          paramMap = route.snapshot.paramMap,
          aId = paramMap.get('aId')!, bId = paramMap.get('bId');

    this.maxValue = +(paramMap.get('maxValue') || 0);

    this.reverse = Object.keys(route.snapshot.queryParams).includes('reverse') &&
                   route.snapshot.queryParams.reverse !== "false";

    this.legend = calcService.getComparisonLegend(this.maxValue / 100)

    this.imageUrl =
      bId ? `${env.apiBaseUrl}/calculation/diff/${aId}/${bId}?max=${this.maxValue}` :
            `${env.apiBaseUrl}/calculation/diff/${aId}?max=${this.maxValue}${this.reverse ? '&reverse=true' : ''}`;

    reportService.getComparisonReport(aId, bId, this.reverse).subscribe({
      next(report) {
        that.report = report;
        that.report.a = setOverflowProperty(report.a);
        that.report.b = setOverflowProperty(report.b);
        that.area = reportService.calculateArea(report.a);
        that.loadingReport = false;

        that.store.dispatch(MetadataActions.fetchMetadataForBaseline({ baselineName: report.a.baselineName }));
        that.areaDictA = reportService.setAreaDict(report.a);
        that.areaDictB = reportService.setAreaDict(report.b);

        that.allOverflow = {
          'ECOSYSTEM': [...new Set([
          ...(report.a.overflow?.ECOSYSTEM || []),
          ...(report.b.overflow?.ECOSYSTEM || [])])],
          'PRESSURE': [...new Set([
          ...(report.a.overflow?.PRESSURE || []),
          ...(report.b.overflow?.PRESSURE || [])])]
        };

        that.chartWeightThresholdPercentage = formatPercent(report.a.chartWeightThreshold, that.locale);
      },
      error() {
        that.loadingReport = false;
      }
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
    unionOfBandKeys.forEach(band => {
      const [a, b] = map(components, band);
      diffs[band] = relativeDifference(a, b);
      }
    );
    return diffs;
  }
}
