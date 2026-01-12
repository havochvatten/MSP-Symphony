import { Component, inject } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { of } from 'rxjs';
import { filter, switchMap, tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { State } from '../app-reducer';
import { fromJS } from "immutable";

import { MetadataActions } from '@data/metadata';
import { Report } from '@data/calculation/calculation.interfaces';
import { environment as env } from "@src/environments/environment";
import { NormalizationType } from "@data/calculation/calculation.service";
import { ReportService } from "@src/app/report/report.service";
import { AbstractReport } from "@src/app/report/abstract-report.component";

@Component({
  selector: 'app-calculation-report',
  templateUrl: './calculation-report.component.html',
  styleUrls: ['./report.component.scss'],
  standalone: false
})
export class CalculationReportComponent extends AbstractReport<Report> {
  private readonly translate = inject(TranslateService)
  private readonly store = inject(Store<State>);
  private readonly route = inject(ActivatedRoute);
  private readonly reportService = inject(ReportService);


  area?: number;
  areaDict: Map<number, string> = new Map<number, string>();
  isDomainNormalization = false;

  constructor() {

    super();
    const route = this.route;
    const reportService = this.reportService;

    route.paramMap
      .pipe(
        switchMap((paramMap: ParamMap) => of(paramMap.get('calcId'))),
        filter(calcId => calcId !== null),
        tap(calcId => {
          this.imageUrl = `${env.apiBaseUrl}/calculation/${calcId}/image`;
          reportService.getReport(calcId as string).subscribe({
            next: report => {
              this.reportSignal.set(report);
              this.area = reportService.calculateArea(report);
              this.loadingReport = false;
              this.store.dispatch(MetadataActions.fetchMetadataForBaseline({baselineName: report.baselineName}));
              window.parent.postMessage({type: 'calcReportLoaded', calcId: +calcId!}, window.origin);
              this.areaDict = reportService.setAreaDict(report);
              this.isDomainNormalization = report.normalization.type === NormalizationType.DOMAIN;
            },
            error: () => {
              this.loadingReport = false;
            }
          });
        })
      )
      .subscribe();
  }

  calculatePercentOfTotal(components: Record<number, number>, total: number): Record<string, number> {
    return fromJS(components)
      .map(x => total && (100 * (x as number)) / total)
      .toJS() as Record<string, number>;
  }

  getGroupedMatrixMap(): Map<string, string[]> {
    const matrixMap = new Map<string, string[]>(), report = this.reportSignal();
    let mxName: string | undefined

    if (report !== null) {
      for (const mxEntry of report.areaMatrices) {
        mxName = mxEntry.matrix;
        if (matrixMap.get(mxName)) {
          matrixMap.get(mxName)?.push(mxEntry.areaName);
        } else {
          matrixMap.set(mxName, [mxEntry.areaName]);
        }
      }

      if (matrixMap.size === 1 && report.areaMatrices.length > 1) {
        matrixMap.set(mxName!, [this.translate.instant('report.sensitivity-matrices.all-areas')]);
      }
    }
    return matrixMap;
  }
}
