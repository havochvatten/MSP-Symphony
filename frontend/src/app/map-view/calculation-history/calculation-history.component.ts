import { Component, ElementRef, NgModuleRef, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { tap } from "rxjs/operators";
import { select, Store } from '@ngrx/store';
import { environment } from "@src/environments/environment";
import { State } from '@src/app/app-reducer';
import { DialogService } from '@shared/dialog/dialog.service';
import { ListItemsSort } from "@data/common/sorting.interfaces";
import { CalculationActions, CalculationSelectors } from '@data/calculation';
import { CalculationService } from "@data/calculation/calculation.service";
import { CalculationSlice } from '@data/calculation/calculation.interfaces';
import { UserSelectors } from "@data/user";
import { Baseline } from "@data/user/user.interfaces";
import { CalculationReportModalComponent } from "@shared/report-modal/calculation-report-modal.component";
import { ConfirmationModalComponent } from "@shared/confirmation-modal/confirmation-modal.component";
import { TranslateService } from "@ngx-translate/core";
import { Listable } from "@shared/list-filter/listable.directive";
import {
  ConfirmGenerateComparisonComponent
} from "@src/app/map-view/calculation-history/confirm-generate-comparison/confirm-generate-comparison.component";

@Component({
  selector: 'app-history',
  templateUrl: './calculation-history.component.html',
  styleUrls: ['./calculation-history.component.scss', '../list-actions.scss']
})
export class CalculationHistoryComponent extends Listable implements OnInit, OnDestroy {
  calculations$ = this.store.select(CalculationSelectors.selectCalculations);
  comparedCalculations$ = this.store.select(CalculationSelectors.selectComparedCalculations);
  baselineCalculations$?: Observable<CalculationSlice[]>;
  loading$?: Observable<boolean>;
  baseline?: Baseline;
  editingName: string|false = false;
  loadingCalculations: Set<number> = new Set<number>();
  environment = environment;
  private visibleResults$: Subscription;
  private nameInputEl!: ElementRef;

  private visibleResults: number[] = [];
  private calcLoadingState$: Subscription;
  private checkMessageHandler: ((this: Window, ev: MessageEvent<unknown>) => unknown) = () => undefined;
  isMultiMode = signal<boolean>(false);
  selectedIds: number[] = [];


  constructor(
    private store: Store<State>,
    private calcService: CalculationService,
    private dialogService: DialogService,
    private translateService: TranslateService,
    private moduleRef: NgModuleRef<never>
  ) {
    super();
    this.store.dispatch(CalculationActions.fetchCalculations());
    this.loading$ = this.store.select(CalculationSelectors.selectLoadingCalculations);

    this.store.pipe(
      select(UserSelectors.selectBaseline),
    ).subscribe((baseline) => {
      this.baseline = baseline;
      if (baseline)
        this.baselineCalculations$ = this.calcService.getBaselineCalculations(baseline.name).pipe(
          tap(baselineCalculations => {
            if (environment.showBaseCalculations) {
              baselineCalculations.forEach(c =>
                this.calcService.addResult(c.id).
                catch(error => console.warn(error)));
            }
          })
        );
      this.checkMessageHandler = this.checkMessage.bind(this);
    });

    this.visibleResults$ = this.store.select(CalculationSelectors.selectVisibleResults).pipe().subscribe(
      (visibleResults) => {
        this.visibleResults = visibleResults;
      }
    );

    this.calcLoadingState$ = this.store.select(CalculationSelectors.selectCalculationLoadingState).pipe().subscribe(
      (calcLoadingState) => {
        this.loadingCalculations = new Set<number>([...calcLoadingState.loadingResults, ...calcLoadingState.loadingReports]);
      }
    );
  }

  setSort(sortType: ListItemsSort): void {
      this.store.dispatch(CalculationActions.setCalculationSortType({ sortType }));
  }

  @ViewChild('name') set content(content: ElementRef) {
    if (content)
      this.nameInputEl = content;
  }

  resultIsVisible(id: number) {
    return this.visibleResults.includes(id);
  }

  showReport(id: number) {
    this.store.dispatch(CalculationActions.setReportLoadingState({ calculationId: id, loadingState: true }));
    this.dialogService.open(CalculationReportModalComponent, this.moduleRef, {
      data: { id }
    });
  }

  loadResult(calculationId: number) {
    if (this.editingName)
      return;
    this.store.dispatch(CalculationActions.loadCalculationResult({ calculationId }));
  }

  removeResult(calculationId: number) {
    this.calcService.removeResultPixels(calculationId);
  }

  async confirmDelete(calculation: CalculationSlice, event: Event) {

    event.stopPropagation();   // prevent "click-through" on the list entry as it
    event.preventDefault();    // would draw the calculation result selected for
                               // deletion to the map

    const deletionConfirmed = await this.dialogService.open(ConfirmationModalComponent, this.moduleRef,
      { data: {
                header: this.translateService.instant('map.history.delete-modal.header'),
                message: this.translateService.instant('map.history.delete-modal.message', { calculationName: calculation.name }),
                confirmText: this.translateService.instant('map.history.delete-modal.confirm'),
                confirmColor: 'warn',
                buttonsClass: 'right'
              }
            });

    if (deletionConfirmed) {
      this.store.dispatch(CalculationActions.deleteCalculation({
        calculationToBeDeleted: calculation
      }));
    }
  }

  editName($event: MouseEvent, id: string) {
    this.editingName = id;
    setTimeout(() => {
      this.nameInputEl.nativeElement.focus();
    }, 1);
    $event.stopPropagation();
  }

  // saveName($event: any, calc: CalculationSlice, index: number) {
  //   this.store.dispatch(     // optimistically set new name
  //     CalculationActions.updateName({ index, newName: $event.target.value }));
  //
  //   const that = this,
  //         oldName = calc.name;
  //   this.calcService.updateName(calc.id, $event.target.value).pipe(
  //     retry(2),
  //   ).subscribe({
  //     next (updatedCalc) {
  //        // Already changed name above
  //     },
  //     error(err: HttpErrorResponse) {
  //       // TODO Show popup with error
  //       that.store.dispatch(CalculationActions.updateName({ index, newName: oldName }));
  //     }
  //   });
  //
  //   this.editingName = false;
  // }

  cancelEdit($event: FocusEvent) {
    setTimeout(() => {
      this.editingName = false;
    }, 0);
    $event.stopPropagation();
    $event.preventDefault();
  }

  checkMessage(msg: MessageEvent){
    if(msg.data.type === 'calcReportLoaded') {
      this.store.dispatch(CalculationActions.setReportLoadingState({ calculationId: msg.data.calcId, loadingState: false }));
    }
  }

  ngOnDestroy(): void {
    this.visibleResults$.unsubscribe();
    this.calcLoadingState$.unsubscribe();
    window.removeEventListener("message", this.checkMessageHandler);
  }

  ngOnInit(): void {
    window.addEventListener("message", this.checkMessageHandler);
  }

  multiSelect(id: number) {
    if(!this.selectedIds.includes(id)) {
      this.selectedIds = [...this.selectedIds, id];
    } else {
      this.selectedIds = this.selectedIds.filter(i => i !== id);
    }
  }

  isDisabled: () => boolean = () => { return !this.isMultiMode() || this.selectedIds.length === 0 };

  deleteSelectedCalculations = async () => {
    const multi = this.selectedIds.length > 1,
          deletionConfirmed = await this.dialogService.open(ConfirmationModalComponent, this.moduleRef,
      { data: {
          header: this.translateService.instant(
            multi ? 'map.history.delete-modal.header-multiple' :
                    'map.history.delete-modal.header'),
          message: this.translateService.instant(
            multi ? 'map.history.delete-modal.message-multiple' :
                    'map.history.delete-modal.message-single', { count: this.selectedIds.length }),
          confirmText: this.translateService.instant('map.history.delete-modal.confirm'),
          confirmColor: 'warn',
          buttonsClass: 'right'
        }
      });
    if(deletionConfirmed) {
      this.store.dispatch(CalculationActions.deleteMultipleCalculations({calculationIds: this.selectedIds}));
      this.selectedIds = [];
      this.isMultiMode.set(false);
    }
  }

  generateComparisonDataSet = async () => {
    if(this.selectedIds.length > 0) {
      const cmpName = await this.dialogService.open(ConfirmGenerateComparisonComponent, this.moduleRef);

      if(typeof cmpName === 'string' && cmpName.length > 0) {
        this.store.dispatch(CalculationActions.generateCompoundComparison(
          {
            comparisonName: cmpName,
            calculationIds: [...this.selectedIds]
          }))
        this.selectedIds = [];
        this.isMultiMode.set(false);
      }
    }
  };
}
