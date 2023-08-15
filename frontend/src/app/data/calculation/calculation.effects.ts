import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
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

  @Effect()
  fetchCalculations$ = this.actions$.pipe(
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
  );

  @Effect()
  deleteCalculation$ = this.actions$.pipe(
    ofType(CalculationActions.deleteCalculation),
    mergeMap(({ calculationToBeDeleted }) =>
      from(this.calcService.removeResult(calculationToBeDeleted.id)).pipe(
        mergeMap((_a,_i) => {
          CalculationActions.deleteCalculationSuccess();
          return of(CalculationActions.fetchCalculations(), ScenarioActions.fetchScenarios());
        }),
        catchError(({status, error: message}) =>
          of(CalculationActions.deleteCalculationFailure({error: {status, message}}))
        )
      )
    )
  );

  @Effect()
  fetchLegend$ = this.actions$.pipe(
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
  );

  @Effect()
  fetchComparisonLegend$ = this.actions$.pipe(
    ofType(CalculationActions.fetchComparisonLegend),
    mergeMap(({ comparisonTitle }) =>
      this.calcService.getLegend('comparison').pipe(
        map(legend => CalculationActions.fetchComparisonLegendSuccess({ legend, comparisonTitle, maxValue: 0.45 })),
        catchError(({ status, error: message }) =>
          of(
            CalculationActions.fetchLegendFailure({
              error: { status, message }
            })
          )
        )
      )
    )
  );

  @Effect()
  fetchDynamicComparisonLegend$ = this.actions$.pipe(
    ofType(CalculationActions.fetchDynamicComparisonLegend),
    mergeMap(({ dynamicMax, comparisonTitle }) =>
      this.calcService.getDynamicComparisonLegend(dynamicMax).pipe(
        map(legend => CalculationActions.fetchComparisonLegendSuccess({ legend, comparisonTitle, maxValue: dynamicMax })),
        catchError(({ status, error: message }) =>
          of(
            CalculationActions.fetchLegendFailure({
              error: { status, message }
            })
          )
        )
      )
    )
  );


  @Effect()
  fetchPercentile$ = this.actions$.pipe(
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
  );
}
