import { Component, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Store } from '@ngrx/store';
import { State } from '../app-reducer';
import { MetadataActions, MetadataSelectors } from '@data/metadata';
import { TranslateService } from '@ngx-translate/core';
import { Report, ComparisonReport, LegendColor, Legend } from '@data/calculation/calculation.interfaces';
import { environment as env } from "@src/environments/environment";
import { HttpClient } from "@angular/common/http";
import { filter } from "rxjs/operators";
import { BandMap } from "@src/app/report/report.component";
import { BandGroup } from "@data/metadata/metadata.interfaces";
import MetadataService from "@data/metadata/metadata.service";
import { ReportService } from "@src/app/report/report.service";
import { CalculationService } from "@data/calculation/calculation.service";
import { map } from "lodash";

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
  private imageUrl?: string;
  bandMap: BandMap = { b: {}, e: {}};
  metadata$: Observable<{
    ecoComponent: BandGroup[];
    pressureComponent: BandGroup[];
  }>;
  now = new Date();
  private legend:Observable<Legend>;

  constructor(
    private translate: TranslateService,
    private store: Store<State>,
    private route: ActivatedRoute,
    private reportService: ReportService,
    private calcService: CalculationService,
    private http: HttpClient,
    private metadataService: MetadataService
  ) {
    this.locale = this.translate.currentLang;
    this.legend = calcService.getLegend('comparison');

    const that = this;
    route.paramMap.subscribe((result: ParamMap) => {
      const aId = result.get('aId')!, bId = result.get('bId')!;
      this.imageUrl = `${env.apiBaseUrl}/calculation/diff/${aId}/${bId}`;
      reportService.getComparisonReport(aId, bId).subscribe({
        next(report) {
          that.report = report;
          that.area = reportService.calculateArea(report.a);
          that.loadingReport = false;

          that.store.dispatch(MetadataActions.fetchMetadata({ baseline: report.a.baselineName }));
        },
        error() {
          that.loadingReport = false;
          }
        });
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

  toArray(reports: ComparisonReport):Report[] {
    return reports ? [reports.a, reports.b] : [];
  }

  // Compute relative difference with regard to first scenario element in components
  calculateRelativeDifference(components: Record<string, number>[]) {
    // Would be nicer written as an Immutable.js map operation
    const diffs: Record<string, number> = {};
    const unionOfBandKeys = new Set([...Object.keys(components[0]), ...Object.keys(components[1])]);
    unionOfBandKeys.forEach(band => {
      const [a, b] = map(components, band);
      if (!a && !b)  // avoid divide by zero
        diffs[band] = 0;
      else if (!a && b)
        diffs[band] = 100;
      else if (a && !b)
        diffs[band] = -100;
      else if (a && b)
        diffs[band] = 100*(b-a)/a;
      else // both are undefined, this case will not happen since band then is excluded
        console.error("Unhandled case of relative difference!", a, b);
      }
    );
    return diffs;
  }
}
