import { Injectable } from '@angular/core';
import {
  catchError,
  concatMap,
  filter,
  map,
  mergeMap,
  retry,
  withLatestFrom
} from 'rxjs/operators';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { ScenarioService } from '@data/scenario/scenario.service';
import { ScenarioActions, ScenarioSelectors } from '@data/scenario/index';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { State } from '@src/app/app-reducer';
import { UserSelectors } from '@data/user';
import {
  fetchAreaMatrices,
  fetchAreaMatricesFailure,
  fetchAreaMatricesSuccess
} from '@data/scenario/scenario.actions';

@Injectable()
export class ScenarioEffects {
  constructor(
    private actions$: Actions,
    private store: Store<State>,
    private scenarioService: ScenarioService
  ) {}

  @Effect()
  fetchScenarios$ = this.actions$.pipe(
    ofType(ScenarioActions.fetchScenarios),
    mergeMap(() =>
      this.scenarioService.getUserScenarios().pipe(
        map(scenarios => ScenarioActions.fetchScenariosSuccess({ scenarios })),
        catchError(({ status, error: message }) =>
          of(ScenarioActions.fetchScenariosFailure({ error: { status, message } }))
        )
      )
    )
  );

  @Effect()
  saveScenario$ = this.actions$.pipe(
    ofType(ScenarioActions.saveActiveScenario),
    mergeMap(({ scenarioToBeSaved }) => {
      return this.scenarioService.save(scenarioToBeSaved).pipe(
        retry(2),
        map(savedScenario => ScenarioActions.saveScenarioSuccess({ savedScenario })),
        catchError(({ status, error: message }) =>
          of(ScenarioActions.saveScenarioFailure({ error: { status, message } }))
        )
      );
    })
  );

  @Effect()
  saveScenarioArea$ = this.actions$.pipe(
    ofType(ScenarioActions.saveScenarioArea),
    concatMap(action =>
      of(action).pipe(withLatestFrom(this.store.select(ScenarioSelectors.selectActiveScenario)))
    ),
    mergeMap(([{ areaToBeSaved }, scenario]) => {
      return this.scenarioService.save(scenario!).pipe(
      map((savedScenario) =>
          ScenarioActions.saveScenarioSuccess({ savedScenario })),
          catchError(({ status, error: message }) =>
            of(ScenarioActions.saveScenarioFailure({ error: { status, message } }))
          )
      );
    })
  );

  @Effect()
  deleteScenario$ = this.actions$.pipe(
    ofType(ScenarioActions.deleteScenario),
    mergeMap(({ scenarioToBeDeleted }) => {
      return this.scenarioService.delete(scenarioToBeDeleted.id).pipe(
        map(() => ScenarioActions.fetchScenarios()),
        catchError(({ status, error: message }) =>
          of(ScenarioActions.deleteScenarioFailure({ error: { status, message } }))
        )
      );
    })
  );

  @Effect()
  deleteScenarioArea$ = this.actions$.pipe(
    ofType(ScenarioActions.deleteScenarioArea),
    mergeMap(({ areaId }) => {
      return this.scenarioService.deleteArea(areaId).pipe(
        map(() => ScenarioActions.fetchScenarios()),
        catchError(({ status, error: message }) =>
          of(ScenarioActions.deleteScenarioAreaFailure({ error: { status, message } }))
        )
      );
    })
  );

  @Effect()
  toggleChangeVisibility$ = this.actions$.pipe(
    ofType(ScenarioActions.toggleChangeAreaVisibility),
    map(({ feature, featureIndex }) => {
      const visible = !!this.scenarioService.setScenarioChangeVisibility(feature);
      return ScenarioActions.setChangeAreaVisibility({ featureIndex, visible });
    })
  );

  @Effect()
  fetchMatrices$ = this.actions$.pipe(
    ofType(fetchAreaMatrices),
    concatMap(action =>
      of(action).pipe(withLatestFrom(this.store.select(UserSelectors.selectBaseline)))
    ),
    filter(([_, baseline]) => baseline !== undefined),
    mergeMap(([{ scenarioId }, baseline]) =>
      this.scenarioService.getAreaMatrixParams(scenarioId, baseline!.name).pipe(
        mergeMap((matrixDataResponse: any) =>
          of(fetchAreaMatricesSuccess({ matrixDataMap: matrixDataResponse.matrixData }))
        ),
        catchError(({status, error}) =>
          of(fetchAreaMatricesFailure({error: {status, message: error.errorMessage}}))
        )
      )
    )
  );
}
