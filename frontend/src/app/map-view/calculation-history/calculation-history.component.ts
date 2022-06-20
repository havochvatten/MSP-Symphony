import { Component, ElementRef, NgModuleRef, ViewChild } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { State } from '@src/app/app-reducer';
import { DialogService } from '@src/app/shared/dialog/dialog.service';
import { CalculationActions, CalculationSelectors } from '@data/calculation';
import { CalculationSlice } from '@data/calculation/calculation.interfaces';
import { Observable } from 'rxjs';
import { CalculationService } from "@data/calculation/calculation.service";
import { retry, tap } from "rxjs/operators";
import { UserSelectors } from "@data/user";
import { Baseline } from "@data/user/user.interfaces";
import { environment } from "@src/environments/environment";
import { CalculationReportModalComponent } from "@shared/report-modal/calculation-report-modal.component";
import { HttpErrorResponse } from "@angular/common/http";

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

    const that = this;
    let oldName = calc.name;
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
