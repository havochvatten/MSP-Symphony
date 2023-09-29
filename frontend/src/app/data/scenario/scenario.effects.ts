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
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ScenarioService } from '@data/scenario/scenario.service';
import { ScenarioActions, ScenarioSelectors } from '@data/scenario/index';
import { from, of } from 'rxjs';
import { Store } from '@ngrx/store';
import { State } from '@src/app/app-reducer';
import { UserSelectors } from '@data/user';
import {
  fetchAreaMatrices,
  fetchAreaMatricesFailure,
  fetchAreaMatricesSuccess, fetchAreaMatrixSuccess, splitAndReplaceScenarioAreaSuccess
} from '@data/scenario/scenario.actions';

@Injectable()
export class ScenarioEffects {
  constructor(
    private actions$: Actions,
    private store: Store<State>,
    private scenarioService: ScenarioService
  ) {}

  fetchScenarios$ = createEffect(() => this.actions$.pipe(
    ofType(ScenarioActions.fetchScenarios),
    mergeMap(() =>
      this.scenarioService.getUserScenarios().pipe(
        map(scenarios => ScenarioActions.fetchScenariosSuccess({ scenarios })),
        catchError(({ status, error: message }) =>
          of(ScenarioActions.fetchScenariosFailure({ error: { status, message } }))
        )
      )
    )
  ));

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

  saveScenarioArea$ = createEffect(() => this.actions$.pipe(
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
  ));

  deleteScenario$ = createEffect(() => this.actions$.pipe(
    ofType(ScenarioActions.deleteScenario),
    mergeMap(({ scenarioToBeDeleted }) => {
      return this.scenarioService.delete(scenarioToBeDeleted.id).pipe(
        map(() => ScenarioActions.fetchScenarios()),
        catchError(({ status, error: message }) =>
          of(ScenarioActions.deleteScenarioFailure({ error: { status, message } }))
        )
      );
    })
  ));

  deleteScenarioArea$ = createEffect(() => this.actions$.pipe(
    ofType(ScenarioActions.deleteScenarioArea),
    mergeMap(({ areaId }) => {
      return this.scenarioService.deleteArea(areaId).pipe(
        map(() => ScenarioActions.fetchScenarios()),
        catchError(({ status, error: message }) =>
          of(ScenarioActions.deleteScenarioAreaFailure({ error: { status, message } }))
        )
      );
    })
  ));

  addScenarioAreas$ = createEffect(() => this.actions$.pipe(
    ofType(ScenarioActions.addAreasToActiveScenario),
    concatMap(action =>
      of(action).pipe(withLatestFrom(this.store.select(ScenarioSelectors.selectActiveScenario)))
    ),
      mergeMap(([{ areas }, scenario]) => {
          return this.scenarioService.addScenarioAreas(scenario!.id, areas).pipe(
            map((newAreas) => {
              return ScenarioActions.addScenarioAreasSuccess({ newAreas });
            }),
            catchError(({status, error: message}) =>
              of(ScenarioActions.saveScenarioFailure({error: {status, message}}))
            )
          )
        }
      )
  ));

  toggleChangeVisibility$ = createEffect(() => this.actions$.pipe(
    ofType(ScenarioActions.toggleChangeAreaVisibility),
    map(({ feature, featureIndex }) => {
      const visible = !!this.scenarioService.setScenarioChangeVisibility(feature);
      return ScenarioActions.setChangeAreaVisibility({ featureIndex, visible });
    })
  ));

  fetchMatrices$ = createEffect(() => this.actions$.pipe(
    ofType(fetchAreaMatrices, ScenarioActions.addScenarioAreasSuccess),
    concatMap(action =>
      of(action).pipe(withLatestFrom(this.store.select(UserSelectors.selectBaseline)))
    ),
    filter(([_, baseline]) => baseline !== undefined),
    mergeMap(([action, baseline]) => {
      const scenarioId = action.type === ScenarioActions.fetchAreaMatrices.type ? action.scenarioId : action.newAreas[0].scenarioId;

      // Although it seems preferable to maybe split the "addScenarioAreasSuccess" action result up
      // to multiple requests utilizing rxJs ´from´ method at this junction, the possibility of calc
      // area overlap for any of the added areas seems to render that approach prohibitively complex.
      // As a compromise we differentiate only by single vs multiple areas added, but notably adding
      // at least two new areas at a time will however redundantly fetch matrices for the entire
      // scenario.
      // There is potential for improvement performancewise, but it's not clear how to do it without
      // introducing excessive code complexity.
      if(action.type === ScenarioActions.addScenarioAreasSuccess.type && action.newAreas.length === 1) {
        return this.scenarioService.getSingleAreaMatrixParams(action.newAreas[0].id, baseline!.name).pipe(
          mergeMap((singleMatrixDataResponse: any) =>
            of(fetchAreaMatrixSuccess({
              areaId: action.newAreas[0].id,
              matrixData: singleMatrixDataResponse
            }))
          ),
          catchError(({status, error}) =>
            of(fetchAreaMatricesFailure({error: {status, message: error.errorMessage}}))
          )
        );
      } else {
        return this.scenarioService.getAreaMatrixParams(scenarioId, baseline!.name).pipe(
          mergeMap((matrixDataResponse: any) =>
            of(fetchAreaMatricesSuccess({matrixDataMap: matrixDataResponse.matrixData}))
          ),
          catchError(({status, error}) =>
            of(fetchAreaMatricesFailure({error: {status, message: error.errorMessage}}))
          )
        );
      }
    })
  ));

  splitAndReplaceScenarioArea$ = createEffect(() => this.actions$.pipe(
    ofType(ScenarioActions.splitAndReplaceScenarioArea),
    mergeMap(({ scenarioId, replacedAreaId, replacementAreas }) => {
      return this.scenarioService.splitAndReplaceScenarioArea(scenarioId, replacedAreaId, replacementAreas).pipe(
        map((scenario) => ScenarioActions.splitAndReplaceScenarioAreaSuccess({ updatedScenario: scenario })),
        catchError(({ status, error: message }) =>
          of(ScenarioActions.saveScenarioFailure({ error: { status, message } }))
        )
      );
    }))
  );

  copyScenario$ = createEffect(() => this.actions$.pipe(
    ofType(ScenarioActions.copyScenario),
    mergeMap(({ scenarioId, options }) => {
      return this.scenarioService.copy(scenarioId, options).pipe(
        map((copiedScenario) => ScenarioActions.copyScenarioSuccess({ copiedScenario })),
        catchError(({ status, error: message }) =>
          of(ScenarioActions.copyScenarioFailure({ error: { status, message } }))
        )
      );
    }))
  );

  transferChangesToScenario$ = createEffect(() => this.actions$.pipe(
    ofType(ScenarioActions.transferScenarioChanges),
    concatMap(action =>
      of(action).pipe(withLatestFrom(this.store.select(ScenarioSelectors.selectActiveScenario)))
    ),
    mergeMap(([{changesSelection}, scenario]) => {
      if(!scenario) return of(ScenarioActions.transferChangesFailure(
        {error: {status: 500, message: 'No active scenario'}})
      );
        return (changesSelection.areaId !== null ?
        this.scenarioService.transferAreaChanges(
          scenario.id,
          changesSelection.areaId,
          changesSelection.overwrite) :
        this.scenarioService.transferChanges(
          scenario.id,
          changesSelection.scenarioId!,
          changesSelection.overwrite)).pipe(
          map((scenario) => ScenarioActions.transferChangesSuccess({scenario})),
          catchError(({status, error: message}) =>
            of(ScenarioActions.transferChangesFailure({error: {status, message}}))
          )
        );
      }
    )
  ));

  transferChangesToArea$ = createEffect(() => this.actions$.pipe(
    ofType(ScenarioActions.transferScenarioAreaChanges),
    concatMap(action =>
      of(action).pipe(withLatestFrom(this.store.select(ScenarioSelectors.selectActiveScenario),
                                     this.store.select(ScenarioSelectors.selectActiveScenarioArea)))
    ),
    mergeMap(([{changesSelection}, scenario, area]) => {
      if(!scenario) return of(ScenarioActions.transferChangesFailure(
        {error: {status: 500, message: 'No active scenario'}})
      );
      if(area === undefined) return of(ScenarioActions.transferChangesFailure(
        {error: {status: 500, message: 'No active scenario area'}})
      );
      return (changesSelection.areaId !== null ?
        this.scenarioService.transferAreaChangesToArea(
          scenario.areas[area].id,
          changesSelection.areaId,
          changesSelection.overwrite) :
        this.scenarioService.transferChangesToArea(
          scenario.areas[area].id,
          changesSelection.scenarioId!,
          changesSelection.overwrite)).pipe(
          map((scenario) => ScenarioActions.transferChangesSuccess({scenario})),
          catchError(({status, error: message}) =>
            of(ScenarioActions.transferChangesFailure({error: {status, message}}))
          )
        );
    })
  ));

  splitScenarioForBatch$ = createEffect(() => this.actions$.pipe(
    ofType(ScenarioActions.splitScenarioForBatch),
    mergeMap(({ scenarioId, options }) => {
      return this.scenarioService.splitScenarioForBatch(scenarioId, options).pipe(
        map((response) => ScenarioActions.splitScenarioForBatchSuccess(response)),
        catchError(({ status, error: message }) =>
          of(ScenarioActions.splitScenarioForBatchFailure({ error: { status, message } }))
        )
      );
    })
  ));

  splitScenarioForBatchSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(ScenarioActions.splitScenarioForBatchSuccess),
    mergeMap((response) => {
      return from([ScenarioActions.setAutoBatch({ ids: response.splitScenarioIds }),
                   ScenarioActions.fetchScenarios()]);
    })
  ));
}
