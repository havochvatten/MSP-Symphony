import { Component } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { filter, switchMap, tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { State } from '../app-reducer';
import { MetadataActions, MetadataSelectors } from '@data/metadata';
import { BandGroup, LayerData } from '@data/metadata/metadata.interfaces';
import { TranslateService } from '@ngx-translate/core';
import { ChartData } from './pressure-chart/pressure-chart.component';
import { Report } from '@data/calculation/calculation.interfaces';
import { environment as env } from "@src/environments/environment";
import buildInfo from '@src/build-info';
import { CalculationActions, CalculationSelectors } from "@data/calculation";
import { NormalizationType } from "@data/calculation/calculation.service";
import { ReportService } from "@src/app/report/report.service";
import MetadataService from "@data/metadata/metadata.service";
import { fromJS } from "immutable";
import { cloneDeep } from "lodash";

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

  env = env;
  buildInfo = buildInfo;

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
              that.store.dispatch(MetadataActions.fetchMetadata({ baseline: report.baselineName }));
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

  formatChartData(data: ChartData, metadata: LayerData) {
    if (!metadata.ecoComponent.length || !data) return undefined;

    const changeName = (node: any) => {
      try {
        const bands = this.bandMap[node.name[0] as 'b' | 'e'];
        const name = bands[Number(node.name.slice(1))];
        return {
          ...node,
          name
        };
      } catch (error) {
        return { ...node };
      }
    };

    // Needed to make the object extensible
    const _data = cloneDeep(data);
    return {
      ..._data,
      nodes: _data.nodes.map(changeName)
    };
  }

  isDomainNormalization(report: Report) {
    return report.normalization.type === NormalizationType.Domain;
  }

  calculatePercentOfTotal(components: Record<number, number>, total: number) {
    return fromJS(components)
      .map(x => total && (100 * (x as number)) / total)
      .toJS();
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
