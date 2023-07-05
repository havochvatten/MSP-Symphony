import { Component, ElementRef, NgModuleRef, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { retry, tap } from "rxjs/operators";
import { select, Store } from '@ngrx/store';
import { environment } from "@src/environments/environment";
import { State } from '@src/app/app-reducer';
import { DialogService } from '@shared/dialog/dialog.service';
import { CalculationActions, CalculationSelectors } from '@data/calculation';
import { CalculationService } from "@data/calculation/calculation.service";
import { CalculationSlice } from '@data/calculation/calculation.interfaces';
import { ScenarioActions } from "@data/scenario";
import { UserSelectors } from "@data/user";
import { Baseline } from "@data/user/user.interfaces";
import { CalculationReportModalComponent } from "@shared/report-modal/calculation-report-modal.component";
import { HttpErrorResponse } from "@angular/common/http";
import { ConfirmationModalComponent } from "@shared/confirmation-modal/confirmation-modal.component";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: 'app-history',
  templateUrl: './calculation-history.component.html',
  styleUrls: ['./calculation-history.component.scss']
})
export class CalculationHistoryComponent {
  calculations$?: Observable<CalculationSlice[]>;
  baselineCalculations$?: Observable<CalculationSlice[]>;
  loading$?: Observable<boolean>;
  baseline?: Baseline;
  editingName: string|false = false;
  environment = environment;
  private nameInputEl!: ElementRef;

  constructor(
    private store: Store<State>,
    private calcService: CalculationService,
    private dialogService: DialogService,
    private translateService: TranslateService,
    private moduleRef: NgModuleRef<any>
  ) {
    this.store.dispatch(CalculationActions.fetchCalculations());

    this.calculations$ = this.store.select(CalculationSelectors.selectCalculations);
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
    });
  }

  @ViewChild('name') set content(content: ElementRef) {
    if (content)
      this.nameInputEl = content;
  }

  showReport(id: string) {
    this.dialogService.open(CalculationReportModalComponent, this.moduleRef, {
      data: { id }
    });
  }

  load(calculation: CalculationSlice) {
    if (this.editingName)
      return;
    // TODO zoom to area extent
    // TODO Make sure the result cannot be loaded several times
    // set loading flag in state
    // this.store.dispatch(CalculationActions.loadCalculation({calculation}));
      this.calcService.addResult(calculation.id).
        catch(error => console.error(error));
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

  saveName($event: any, calc: CalculationSlice, index: number) {
    this.store.dispatch(     // optimistically set new name
      CalculationActions.updateName({ index, newName: $event.target.value }));

    const that = this,
          oldName = calc.name;
    this.calcService.updateName(calc.id, $event.target.value).pipe(
      retry(2),
    ).subscribe({
      next (updatedCalc) {
        ; // Already changed name above
      },
      error(err: HttpErrorResponse) {
        // TODO Show popup with error
        that.store.dispatch(CalculationActions.updateName({ index, newName: oldName }));
      }
    });

    this.editingName = false;
  }

  cancelEdit($event: FocusEvent) {
    setTimeout(() => {
      this.editingName = false;
    }, 0);
    $event.stopPropagation();
    $event.preventDefault();
  }
}
