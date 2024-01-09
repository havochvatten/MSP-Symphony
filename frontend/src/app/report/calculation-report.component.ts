import { Component } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { of } from 'rxjs';
import { filter, switchMap,tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { State } from '../app-reducer';
import { fromJS } from "immutable";

import { MetadataActions } from '@data/metadata';
import { Report } from '@data/calculation/calculation.interfaces';
import { environment as env } from "@src/environments/environment";
import { NormalizationType } from "@data/calculation/calculation.service";
import { ReportService } from "@src/app/report/report.service";
import { AbstractReport } from "@src/app/report/abstract-report.directive";
import { ChangesProperty } from "@data/scenario/scenario.interfaces";
import { BandType } from "@data/metadata/metadata.interfaces";

@Component({
  selector: 'app-calculation-report',
  templateUrl: './calculation-report.component.html',
  styleUrls: ['./report.component.scss']
})
export class CalculationReportComponent extends AbstractReport {

  report?: Report;
  area?: number;
  areaDict: Map<number, string> = new Map<number, string>();
  isDomainNormalization = false;

  constructor(
    private translate: TranslateService,
    private store: Store<State>,
    private route: ActivatedRoute,
    private reportService: ReportService
  ) {
    super(
      translate,
      store
    );
    const that = this;
    route.paramMap
      .pipe(
        switchMap((paramMap: ParamMap) => of(paramMap.get('calcId'))),
        filter(calcId => calcId !== null),
        tap(calcId => {
          this.imageUrl = `${env.apiBaseUrl}/calculation/${calcId}/image`;
          reportService.getReport(calcId as string).subscribe({
            next: function (report) {
              that.report = report;
              that.area = reportService.calculateArea(report);
              that.loadingReport = false;
              that.store.dispatch(MetadataActions.fetchMetadataForBaseline({baselineName: report.baselineName}));
              window.parent.postMessage({type: 'calcReportLoaded', calcId: +calcId!}, window.origin);
              that.areaDict = reportService.setAreaDict(report);
              that.isDomainNormalization = report.normalization.type === NormalizationType.Domain;

              let allChanges: { [key: number]: { [key: string]: ChangesProperty } } = {};
              allChanges[0] = report.scenarioChanges.baseChanges;
              allChanges = { ...allChanges, ...report.scenarioChanges.areaChanges };

              // There's an argument to be made that this should be done in the backend.
              // Opting for this solution after having tried the other route, since it's
              // arguably (probably) a smaller and cheaper operation, to preprocess here.
              // Also keep in mind that we'll be looking to implement a more thorough
              // handling of the "overflow" phenomenon already in the subsequent release,
              // where this part is very likely to be changed anyway. Making substantial
              // changes that'd introduce complex behaviour to multiple entity classes and
              // dto's in the backend service, which are likewise subject to change in the
              // very short term, I feel is the less reasonable option at this point.

              for (const changes of Object.entries(allChanges)) {
                const index = +changes[0],
                  changeRef = index === 0 ?
                    report.scenarioChanges.baseChanges :
                    report.scenarioChanges.areaChanges[+changes[0]];
                for (const change of Object.entries(changes[1])) {
                  const bandType = change[0];
                  for (const bandChange of Object.entries(change[1] as ChangesProperty)) {
                    const positiveChange =
                      (bandChange[1].offset && bandChange[1].offset > 0) ||
                      (bandChange[1].multiplier && bandChange[1].multiplier > 1) || false;
                    changeRef[bandType][bandChange[0]].hasOverflow =
                      positiveChange &&
                      report.overflow !== null &&
                      report.overflow[bandType as BandType].includes(+bandChange[0]);
                  }
                }
              }
            },
            error() {
              that.loadingReport = false;
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
