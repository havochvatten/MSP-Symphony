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
  metadata$: Observable<{
    ecoComponent: BandGroup[];
    pressureComponent: BandGroup[];
  }>;

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
          reportService.getReport(calcId as string)
            .subscribe({
              next(report) {
                that.report = report;
                that.area = reportService.calculateArea(report);
                that.loadingReport = false;

                that.store.dispatch(MetadataActions.fetchMetadata({ baseline: report.baselineName }));
              },
              error() {
                that.loadingReport = false;
              }
            })
        })).subscribe();

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

  formatChartData(data: ChartData, metadata: LayerData) {
    if (!metadata.ecoComponent.length || !data)
      return undefined;

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
    }

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

  calculatePercentOfTotal(components: Record<number, number> , total: number) {
    return fromJS(components)
      .map((x:number) => total && 100*x/total)
      .toJS();
  }
}
