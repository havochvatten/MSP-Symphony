import { Component, NgModuleRef } from '@angular/core';
import { Store } from "@ngrx/store";
import { State } from "@src/app/app-reducer";
import { DialogRef } from "@shared/dialog/dialog-ref";
import { CalculationActions, CalculationSelectors } from "@data/calculation";
import { CompoundComparisonSlice, DownloadCompoundComparisonOptions } from "@data/calculation/calculation.interfaces";
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationModalComponent } from "@shared/confirmation-modal/confirmation-modal.component";
import { environment as env } from "@src/environments/environment";
import { DialogService } from '@src/app/shared/dialog/dialog.service';
import { Listable } from '@src/app/shared/list-filter/listable.directive';
import { ListItemsSort } from "@data/common/sorting.interfaces";
import {
  DownloadCompoundComparisonDialogComponent
} from "@src/app/map-view/compound-comparison-list-dialog/download-compound-comparison-dialog/download-compound-comparison-dialog.component";

@Component({
  selector: 'app-compound-comparison-list-dialog',
  templateUrl: './compound-comparison-list-dialog.component.html',
  styleUrls: ['./compound-comparison-list-dialog.component.scss']
})
export class CompoundComparisonListDialogComponent extends Listable {

  compoundComparison$ = this.store.select(CalculationSelectors.selectCompoundComparisons);
  apiUrl: string;

  constructor(private store: Store<State>,
              private dialog: DialogRef,
              private moduleRef: NgModuleRef<never>,
              private dialogService: DialogService,
              private translateService: TranslateService) {
    super();
    this.apiUrl = env.apiBaseUrl + '/report/multi-comparison';
  }

  close = () => {
    this.setSort(ListItemsSort.None);
    this.dialog.close();
  }

  async deleteCC (cmp: CompoundComparisonSlice) {
    const confirmDelete = await this.dialogService.open<boolean>(ConfirmationModalComponent, this.moduleRef, {
      data: {
        header: this.translateService.instant('map.compound-data-list.delete-modal.header'),
        message: this.translateService.instant('map.compound-data-list.delete-modal.message',
          { comparisonName: cmp.name }),
        confirmText: this.translateService.instant('controls.delete'),
        confirmColor: 'warn',
        dialogClass: 'center block-identifier wide1',
        buttonsClass: 'no-margin'
      }
    });

    if (confirmDelete) {
      this.store.dispatch(CalculationActions.deleteCompoundComparison({ id: cmp.id }));
    }
  }

  async downloadCC(cmp: CompoundComparisonSlice) {
    const ccDownloadOptions =
      await this.dialogService.open<DownloadCompoundComparisonOptions>(
        DownloadCompoundComparisonDialogComponent, this.moduleRef, {
          data: {
            comparisonName: cmp.name
          }
        });

    if(ccDownloadOptions) {
      const params = new URLSearchParams({
        lang: this.translateService.currentLang,
        nonzero: !ccDownloadOptions.includeUnchanged + '',
        combined: ccDownloadOptions.includeCombined + ''
      });

      if (!ccDownloadOptions.asJson) {
        params.set('meta-terms', this.metaTitlesParam());
      }

      document.location.href =
        `${this.apiUrl}/${cmp.id}/${ccDownloadOptions.asJson ? 'json' : 'ods'}?${params.toString()}`;
    }
  }

  setSort(sortType: ListItemsSort): void {
    this.store.dispatch(CalculationActions.setCompoundComparisonSortType({ sortType }));
  }

  metaTitlesParam(): string {
    const titleCase = (str: string) => str[0].toUpperCase() + str.slice(1),
      titles: {[key:string]: string} = this.translateService.instant([
      'report.cumulative-effect-etc.calculated-area',
      'report.cumulative-effect-etc.average','report.cumulative-effect-etc.std-dev',
      'report.cumulative-effect-etc.max',
      'map.compound-data-list.terms.total', 'map.compound-data-list.terms.sum', 'map.compound-data-list.terms.baseline',
      'map.compound-data-list.terms.difference', 'map.compound-data-list.compound-comparison-data',
      'map.compound-data-list.terms.pixels', 'map.compound-data-list.terms.non-planar', 'map.compound-data-list.terms.combined',
      'map.compound-data-list.terms.scenarioTitle', 'map.compound-data-list.terms.scenario',
      'map.metadata.theme', 'map.metadata.ecosystem', 'map.metadata.pressure']
      );

    return JSON.stringify({
      compoundHeading: titles['map.compound-data-list.compound-comparison-data'],
      area: titles['report.cumulative-effect-etc.calculated-area'],
      total: titles['map.compound-data-list.terms.total'],
      sum: titles['map.compound-data-list.terms.sum'],
      baseline: titles['map.compound-data-list.terms.baseline'],
      difference: titles['map.compound-data-list.terms.difference'],
      average: titles['report.cumulative-effect-etc.average'],
      stddev: titles['report.cumulative-effect-etc.std-dev'],
      max: titles['report.cumulative-effect-etc.max'],
      pixels: titles['map.compound-data-list.terms.pixels'],
      nonPlanar: titles['map.compound-data-list.terms.non-planar'],
      combined: titles['map.compound-data-list.terms.combined'],
      scenarioTitle: titles['map.compound-data-list.terms.scenarioTitle'],
      scenario: titles['map.compound-data-list.terms.scenario'],
      theme: titles['map.metadata.theme'],
      ecosystem: titleCase(titles['map.metadata.ecosystem']),
      pressure: titleCase(titles['map.metadata.pressure'])
    });
  }
}
