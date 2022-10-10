import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { CalculationActions } from './';
import { CalculationService } from './calculation.service';

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
  fetchLegend$ = this.actions$.pipe(
    ofType(CalculationActions.fetchLegend),
    mergeMap(({ legendType }) =>
      this.calcService.getLegend(legendType).pipe(
        map(legend => CalculationActions.fetchLegendSuccess({ legend, legendType })),
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
