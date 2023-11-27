import { Component } from '@angular/core';
import { formatPercent } from "@angular/common";
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Observable, of } from 'rxjs';
import { filter, switchMap, tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { State } from '../app-reducer';
import { fromJS } from "immutable";

import { MetadataActions, MetadataSelectors } from '@data/metadata';
import { BandGroup, LayerData } from '@data/metadata/metadata.interfaces';
import { formatChartData } from './report.util';
import { Report } from '@data/calculation/calculation.interfaces';
import { environment as env } from "@src/environments/environment";
import { CalculationActions, CalculationSelectors } from "@data/calculation";
import { NormalizationType } from "@data/calculation/calculation.service";
import { ReportService } from "@src/app/report/report.service";
import MetadataService from "@data/metadata/metadata.service";
import buildInfo from '@src/build-info';

export type BandMap = Record<'b' | 'e', Record<number, string>>;

@Component({
  selector: 'app-calculation-report',
  templateUrl: './calculation-report.component.html',
  styleUrls: ['./report.component.scss']
})
export class CalculationReportComponent {
  locale = 'en';
  report?: Report;
  loadingReport = true;
  area?: number;
  private imageUrl?: string;
  bandMap: BandMap = { b: {}, e: {} };
  percentileValue$: Observable<number>;
  metadata$: Observable<{
    ecoComponent: BandGroup[];
    pressureComponent: BandGroup[];
  }>;
  areaDict: Map<number, string> = new Map<number, string>();
  symphonyVersion = buildInfo.version;

  constructor(
    private translate: TranslateService,
    private store: Store<State>,
    private route: ActivatedRoute,
    private reportService: ReportService,
    private metadataService: MetadataService
  ) {
    this.locale = this.translate.currentLang;

    const that = this;
    route.paramMap
      .pipe(
        switchMap((paramMap: ParamMap) => of(paramMap.get('calcId'))),
        filter(calcId => calcId !== null),
        tap(calcId => {
          this.imageUrl = `${env.apiBaseUrl}/calculation/${calcId}/image`;
          reportService.getReport(calcId as string).subscribe({
            next(report) {
              that.report = report;
              that.area = reportService.calculateArea(report);
              that.loadingReport = false;
              that.store.dispatch(MetadataActions.fetchMetadataForBaseline({ baselineName: report.baselineName }));
              window.parent.postMessage({ type: 'calcReportLoaded', calcId: +calcId! }, window.origin);
              that.areaDict = reportService.setAreaDict(report);
            },
            error() {
              that.loadingReport = false;
            }
          });
        })
      )
      .subscribe();

    this.metadata$ = this.store.select(MetadataSelectors.selectMetadata);
    this.metadata$.pipe(filter(data => data.ecoComponent.length > 0)).subscribe(layerData => {
      this.bandMap = {
        b: this.metadataService.flattenBandGroups(layerData.pressureComponent),
        e: this.metadataService.flattenBandGroups(layerData.ecoComponent)
      };
    });

    this.percentileValue$ = this.store.select(CalculationSelectors.selectPercentileValue);
    this.store.dispatch(CalculationActions.fetchPercentile());
  }

  formatChartData = formatChartData;
  formatPercent = formatPercent;

  isDomainNormalization(report: Report) {
    return report.normalization.type === NormalizationType.Domain;
  }

  calculatePercentOfTotal(components: Record<number, number>, total: number): Record<string, number> {
    return fromJS(components)
      .map(x => total && (100 * (x as number)) / total)
      .toJS() as Record<string, number>;
  }

  getGroupedMatrixMap(): Map<string, string[]> {
    const matrixMap = new Map<string, string[]>();
    let mxName: string | undefined

    for (const mxEntry of this.report!.areaMatrices) {
      mxName = mxEntry.matrix;
      if (matrixMap.get(mxName)) {
        matrixMap.get(mxName)?.push(mxEntry.areaName);
      } else {
        matrixMap.set(mxName, [mxEntry.areaName]);
      }
    }

    if(matrixMap.size === 1 && this.report!.areaMatrices.length > 1) {
      matrixMap.set(mxName!, [this.translate.instant('report.sensitivity-matrices.all-areas')]);
    }

    return matrixMap;
  }

  setAreaDict(): void {
    const index_ids = Object.keys(this.report!.scenarioChanges.areaChanges);

    index_ids.map((areaId, ix) => {
      this.areaDict.set(+areaId, this.report!.areaMatrices[ix].areaName);
    });
  }
}
