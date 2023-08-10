import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Store } from '@ngrx/store';
import { State } from '../app-reducer';
import { MetadataActions, MetadataSelectors } from '@data/metadata';
import { TranslateService } from '@ngx-translate/core';
import { Report, ComparisonReport, Legend } from '@data/calculation/calculation.interfaces';
import { environment as env } from "@src/environments/environment";
import { HttpClient } from "@angular/common/http";
import { filter } from "rxjs/operators";
import { BandMap } from "@src/app/report/report.component";
import { formatChartData } from "@src/app/report/report.util";
import { BandGroup } from "@data/metadata/metadata.interfaces";
import MetadataService from "@data/metadata/metadata.service";
import { ReportService } from "@src/app/report/report.service";
import { CalculationService } from "@data/calculation/calculation.service";
import { map } from "lodash";
import { relativeDifference } from "@src/app/report/report.util";
import { formatPercent } from "@angular/common";

@Component({
  selector: 'app-calculation-report',
  templateUrl: './comparison-report.component.html',
  styleUrls: ['./report.component.scss'],
})
export class ComparisonReportComponent {
  locale = 'en';
  report?: ComparisonReport;
  loadingReport = true;
  area?: number;

  bandMap: BandMap = { b: {}, e: {}};
  metadata$: Observable<{
    ecoComponent: BandGroup[];
    pressureComponent: BandGroup[];
  }>;
  now = new Date();
  areaDictA: Map<number, string> = new Map<number, string>();
  areaDictB: Map<number, string> = new Map<number, string>();

  isDynamic: boolean;
  dynamicMax: number;

  chartWeightThresholdPercentage: string = '1%';

  private imageUrl: string;
  private legend:Observable<Legend>;

  constructor(
    private translate: TranslateService,
    private store: Store<State>,
    private route: ActivatedRoute,
    private reportService: ReportService,
    private calcService: CalculationService,
    private http: HttpClient,
    private metadataService: MetadataService,
  ) {
    this.locale = this.translate.currentLang;

    const that = this,
          paramMap = route.snapshot.paramMap,
          aId = paramMap.get('aId')!, bId = paramMap.get('bId')!;

    this.isDynamic = route.snapshot.url[0].path === 'compareDynamic'
    this.dynamicMax = +(paramMap.get('dynamicMax') || 0);

    this.legend = (this.isDynamic) ?
      calcService.getDynamicComparisonLegend(this.dynamicMax) :
      calcService.getLegend('comparison');

    this.imageUrl = `${env.apiBaseUrl}/calculation/diff/${aId}/${bId}`
                            + (this.isDynamic ? `?dynamic=true` : '');

    reportService.getComparisonReport(aId, bId).subscribe({
      next(report) {
        that.report = report;
        that.area = reportService.calculateArea(report.a);
        that.loadingReport = false;

        that.store.dispatch(MetadataActions.fetchMetadata({ baseline: report.a.baselineName }));
        that.areaDictA = reportService.setAreaDict(report.a);
        that.areaDictB = reportService.setAreaDict(report.b);

        that.chartWeightThresholdPercentage = formatPercent(report.a.chartWeightThreshold, that.locale);
      },
      error() {
        that.loadingReport = false;
      }
    });

    this.metadata$ = this.store.select(MetadataSelectors.selectMetadata);
    this.metadata$.pipe(
      filter(data => data.ecoComponent.length>0)
    ).subscribe((layerData) => {
      this.bandMap = {
        b: this.metadataService.flattenBandGroups(layerData.pressureComponent),
        e: this.metadataService.flattenBandGroups(layerData.ecoComponent)
      };
    });
  }

  getChartThresholdPercentage(): string {
    return this.chartWeightThresholdPercentage;
  }

  formatChartData = formatChartData;

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
