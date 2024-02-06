import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, concatMap, map, mergeMap, switchMap, withLatestFrom } from 'rxjs/operators';
import { CalculationActions } from './';
import { CalculationService } from './calculation.service';
import { ScenarioActions } from "@data/scenario";
import { UserSelectors } from "@data/user";
import { Store } from "@ngrx/store";
import { State } from "@src/app/app-reducer";

@Injectable()
export class CalculationEffects {
  constructor(private actions$: Actions,
              private store: Store<State>,
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
    ofType(CalculationActions.deleteCalculation, CalculationActions.deleteMultipleCalculations),
    mergeMap((action) =>
      from(this.calcService.deleteResults(
          action.type === CalculationActions.deleteCalculation.type ?
              [action.calculationToBeDeleted.id] :
              action.calculationIds)).pipe(
        mergeMap(() =>
                 of(CalculationActions.deleteCalculationSuccess(), // does nothing atm
                    CalculationActions.fetchCalculations(),
                    ScenarioActions.fetchScenarios())
        ),
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

  generateCompoundComparison$ = createEffect(() => this.actions$.pipe(
    ofType(CalculationActions.generateCompoundComparison),
    concatMap(action =>
      of(action).pipe(withLatestFrom(this.store.select(UserSelectors.selectBaseline)))
    ),
    mergeMap(([ { comparisonName, calculationIds }, baseline ]) =>
      this.calcService.generateCompoundComparison(comparisonName, calculationIds, baseline).pipe(
        mergeMap(comparisonId =>
            of(CalculationActions.generateCompoundComparisonSuccess({ comparisonId }),
               CalculationActions.fetchCompoundComparisons())),
        catchError(({ status, message }) =>
          of(
            CalculationActions.generateCompoundComparisonFailure({
              error: { status, message }
            })
          )
        )
      )
    )
  ));

  deleteCompoundComparison$ = createEffect(() => this.actions$.pipe(
    ofType(CalculationActions.deleteCompoundComparison),
    mergeMap(({ id }) =>
      this.calcService.deleteCompoundComparison(id).pipe(
        mergeMap(() =>
            of(CalculationActions.fetchCompoundComparisons())),
        catchError(({ status, message }) =>
          of(
            CalculationActions.deleteCompoundComparisonFailure({
              error: { status, message }
            })
          )
        )
      )
    )
  ));

  fetchCompoundComparisons$ = createEffect(() => this.actions$.pipe(
    ofType(CalculationActions.fetchCompoundComparisons),
    mergeMap(() =>
      this.calcService.getAllCompoundComparisons().pipe(
        map(compoundComparisons => CalculationActions.fetchCompoundComparisonsSuccess({ compoundComparisons })),
        catchError(({ status, message }) =>
          of(
            CalculationActions.fetchCompoundComparisonsFailure({
              error: { status, message }
            })
          )
        )
      )
    )
  ));
}
