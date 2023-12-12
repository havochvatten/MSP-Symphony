import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { CalculationActions } from './';
import { CalculationService } from './calculation.service';
import { ScenarioActions } from "@data/scenario";

@Injectable()
export class CalculationEffects {
  constructor(private actions$: Actions,
              private calcService: CalculationService) {

  }

  fetchCalculations$ = createEffect(() => this.actions$.pipe(
    ofType(CalculationActions.fetchCalculations),
    mergeMap(() =>
      this.calcService.getAll().pipe(
        map(calculations => CalculationActions.fetchCalculationsSuccess({ calculations })),
        catchError(({ status, error: message }) =>
          of(
            CalculationActions.fetchCalculationsFailure({
              error: { status, message }
            })
          )
        )
      )
    )
  ));

  loadCalculationResult$ = createEffect(() => this.actions$.pipe(
    ofType(CalculationActions.loadCalculationResult),
    mergeMap(({ calculationId }) =>
      this.calcService.addResult(calculationId).then(() =>
        CalculationActions.loadCalculationResultSuccess({ calculationId }))
  )));

  deleteCalculation$ = createEffect(() => this.actions$.pipe(
    ofType(CalculationActions.deleteCalculation),
    mergeMap(({ calculationToBeDeleted }) =>
      from(this.calcService.deleteResult(calculationToBeDeleted.id)).pipe(
        mergeMap((_a,_i) => {
          CalculationActions.deleteCalculationSuccess();
          return of(CalculationActions.fetchCalculations(), ScenarioActions.fetchScenarios());
        }),
        catchError(({status, error: message}) =>
          of(CalculationActions.deleteCalculationFailure({error: {status, message}}))
        )
      )
    )
  ));

  fetchLegend$ = createEffect(() => this.actions$.pipe(
    ofType(CalculationActions.fetchLegend),
    mergeMap(({ legendType }) =>
      this.calcService.getLegend(legendType).pipe(
        map(legend =>
          CalculationActions.fetchLegendSuccess({ legend, legendType })
        ),
        catchError(({ status, error: message }) =>
          of(
            CalculationActions.fetchLegendFailure({
              error: { status, message }
            })
          )
        )
      )
    )
  ));

  fetchDynamicComparisonLegend$ = createEffect(() => this.actions$.pipe(
    ofType(CalculationActions.fetchComparisonLegend),
    mergeMap(({ maxValue, comparisonTitle }) =>
      this.calcService.getComparisonLegend(maxValue).pipe(
        map(legend => CalculationActions.fetchComparisonLegendSuccess({ legend, comparisonTitle, maxValue })),
        catchError(({ status, error: message }) =>
          of(
            CalculationActions.fetchLegendFailure({
              error: { status, message }
            })
          )
        )
      )
    )
  ));

  fetchPercentile$ = createEffect(() => this.actions$.pipe(
    ofType(CalculationActions.fetchPercentile),
    switchMap(() =>
      this.calcService.getPercentileValue().pipe(
        map(response => CalculationActions.fetchPercentileSuccess(response)),
        catchError(({ status, error: message }) =>
          of(
            CalculationActions.fetchPercentileFailure({
              error: { status, message }
            })
          )
        )
      )
    )
  ));

  removeBatchProcess$ = createEffect(() => this.actions$.pipe(
    ofType(CalculationActions.removeFinishedBatchProcess),
    mergeMap(({ id }) =>
      this.calcService.removeFinishedBatchProcess(id).pipe(
        map(() => CalculationActions.removeBatchProcessSuccess({ id })),
        catchError(({ status, error: message }) =>
          of(
            CalculationActions.removeBatchProcessFailure({
              error: { status, message }
            })
          )
        )
      )
    )
  ));

  cancelBatchProcess$ = createEffect(() => this.actions$.pipe(
    ofType(CalculationActions.cancelBatchProcess),
    mergeMap(({ id }) =>
      this.calcService.cancelBatchProcess(id).pipe(
        map(() => CalculationActions.cancelBatchProcessSuccess({ id }))
      )
    )
  ));
}
