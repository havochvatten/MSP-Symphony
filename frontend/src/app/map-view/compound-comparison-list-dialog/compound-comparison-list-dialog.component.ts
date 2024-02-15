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
  styleUrls: ['./compound-comparison-list-dialog.component.scss', '../list-actions.scss']
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
        nonzero: !ccDownloadOptions.allowZeroes + ''
      });

      if (!ccDownloadOptions.asJson) {
        params.set('heading', this.translateService.instant('map.compound-data-list.compound-comparison-data'));
      }

      document.location.href =
        `${this.apiUrl}/${cmp.id}/${ccDownloadOptions.asJson ? 'json' : 'ods'}?${params.toString()}`;
    }
  }

  setSort(sortType: ListItemsSort): void {
    this.store.dispatch(CalculationActions.setCompoundComparisonSortType({ sortType }));
  }
}
