import { Component, NgModuleRef } from '@angular/core';
import { Store } from "@ngrx/store";
import { State } from "@src/app/app-reducer";
import { DialogRef } from "@shared/dialog/dialog-ref";
import { CalculationActions, CalculationSelectors } from "@data/calculation";
import { CompoundComparisonSlice } from "@data/calculation/calculation.interfaces";
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationModalComponent } from "@shared/confirmation-modal/confirmation-modal.component";
import { catchError, take, tap } from "rxjs/operators";
import { of } from "rxjs";
import { DialogService } from '@src/app/shared/dialog/dialog.service';
import { Listable } from '@src/app/shared/list-filter/listable.directive';
import { ListItemsSort } from "@data/common/sorting.interfaces";

@Component({
  selector: 'app-compound-comparison-list-dialog',
  templateUrl: './compound-comparison-list-dialog.component.html',
  styleUrls: ['./compound-comparison-list-dialog.component.scss', '../list-actions.scss']
})
export class CompoundComparisonListDialogComponent extends Listable {

  compoundComparison$ = this.store.select(CalculationSelectors.selectCompoundComparisons);

  constructor(private store: Store<State>,
              private dialog: DialogRef,
              private moduleRef: NgModuleRef<never>,
              private dialogService: DialogService,
              private translateService: TranslateService) {
    super();
  }

  close = () => {
    this.store.dispatch(CalculationActions.setCompoundComparisonSortType({ sortType: ListItemsSort.None }));
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

  setSort(sortType: ListItemsSort): void {
    this.store.dispatch(CalculationActions.setCompoundComparisonSortType({ sortType }));
  }
}
