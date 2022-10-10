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
import { getIn, removeIn, setIn, updateIn } from 'immutable';
import { UserSelectors } from '@data/user';
import { AreaMatrixData } from '@src/app/map-view/scenario/scenario-detail/matrix-selection/matrix.interfaces';
import {
  fetchAreaMatrices,
  fetchAreaMatricesFailure,
  fetchAreaMatricesSuccess
} from '@data/scenario/scenario.actions';
import { CalculationActions } from '@data/calculation';
import { Feature } from 'geojson';

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
  deleteScenario$ = this.actions$.pipe(
    ofType(ScenarioActions.deleteScenario),
    mergeMap(({ scenarioToBeDeleted }) => {
      return this.scenarioService.delete(scenarioToBeDeleted.id).pipe(
        map(() => ScenarioActions.deleteScenarioSuccess()),
        catchError(({ status, error: message }) =>
          of(ScenarioActions.deleteScenarioFailure({ error: { status, message } }))
        )
      );
    })
  );

  @Effect()
  removeFeature$ = this.actions$.pipe(
    ofType(ScenarioActions.deleteBandChangeOrChangeFeature),
    concatMap(action =>
      of(action).pipe(
        withLatestFrom(this.store.select(ScenarioSelectors.selectActiveScenarioChangeFeatures))
      )
    ),
    map(([{ featureIndex, bandId }, features]) => {
      const featuresWithoutChangeAttribute = removeIn(features, [
        featureIndex,
        'properties',
        'changes',
        bandId
      ]);

      const getObject = Object(
        getIn(featuresWithoutChangeAttribute, [featureIndex, 'properties', 'changes'], {})
      );

      const doesFeatureStillHasChanges = getObject && Object.keys(getObject).length > 0;
      if (doesFeatureStillHasChanges)
        return ScenarioActions.deleteBandChangeAttribute({ featureIndex, bandId });
      else {
        // Easier to call out directly than try to work our which feature has been deleted from the state alone
        this.scenarioService.removeScenarioChangeFeature(features![featureIndex].id!);
        return ScenarioActions.deleteChangeFeature({ featureIndex });
      }
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
  hideChanges$ = this.actions$.pipe(
    ofType(CalculationActions.calculationSucceeded),
    map(({ calculation }) => {
      this.scenarioService.hideScenarioChanges();
      return ScenarioActions.hideAllChangeAreas();
    })
  );

  @Effect()
  fetchMatrices$ = this.actions$.pipe(
    ofType(fetchAreaMatrices),
    concatMap(action =>
      of(action).pipe(withLatestFrom(this.store.select(UserSelectors.selectBaseline)))
    ),
    filter(([_, baseline]) => baseline !== undefined),
    mergeMap(([{ geometry }, baseline]) =>
      this.scenarioService.getAreaMatrixParams(geometry, baseline!.name).pipe(
        map((matrixData: AreaMatrixData) => fetchAreaMatricesSuccess({ matrixData })),
        catchError(({ status, error }) =>
          of(fetchAreaMatricesFailure({ error: { status, message: error.errorMessage } }))
        )
      )
    )
  );
}
