import { createFeatureSelector, createSelector } from "@ngrx/store";
import { State as AppState } from "@src/app/app-reducer";
import { ScenarioDisplayMeta, State } from "@data/scenario/scenario.interfaces";
import { sortFuncMap } from "@data/common/sorting.interfaces";

export const selectScenarioState = createFeatureSelector<AppState, State>('scenario');

export const selectScenarios = createSelector(
  selectScenarioState,
  (state) => {
    return [...state.scenarios].sort(sortFuncMap[state.sortScenarios]);
  }
);

export const selectActiveScenario = createSelector(
  selectScenarioState,
  (state) => state?.active !== undefined ? state?.scenarios[state?.active] : undefined
);

export const selectActiveScenarioArea = createSelector(
  selectScenarioState,
  (state) =>
    state?.active !== undefined &&
    state?.activeArea !== undefined &&
    state?.activeArea in state?.scenarios[state?.active].areas ? state.activeArea : undefined
);

export const selectActiveScenarioChanges = createSelector(
  selectActiveScenario,
  (scenario) => scenario?.changes ?? {}
);

export const selectActiveFeature = createSelector(
  selectScenarioState,
  (state) =>
      state.active !== undefined &&
      state.activeArea !== undefined &&
      state.scenarios[state.active].areas[state.activeArea] !== undefined &&
      state.scenarios[state.active].areas[state.activeArea].feature !== undefined ?
    state.scenarios[state.active].areas[state.activeArea].feature :
    undefined
);

export const selectActiveScenarioAreaChanges = createSelector(
  selectScenarioState,
  (state) =>
    state.active !== undefined &&
    state.activeArea !== undefined &&
    state.scenarios[state.active].areas[state.activeArea] !== undefined ?
      state.scenarios[state.active].areas[state.activeArea].changes ?? {} : {}
);

export const selectActiveScenarioDisplayMeta = createSelector<AppState, State, ScenarioDisplayMeta>(
  selectScenarioState,
  (state) => {
    return { scenarioName: state.active !== undefined ? state.scenarios[state.active!].name : undefined,
             activeAreaName: state.active !== undefined && state.activeArea !== undefined ?
                    state.scenarios[state.active!].areas[state.activeArea!].feature.properties!['name'] : undefined
    };
  }
);

export const selectAreaMatrixDataLoading = createSelector(
  selectScenarioState,
  state => state.matricesLoading
);

export const selectAreaMatrixData = createSelector(
  selectScenarioState,
  state => state.matrixData
);

export const selectActiveAreaMatrixData = createSelector(
  selectScenarioState,
  state =>
    state.matrixData && state.scenarios[state.active!].areas[state.activeArea!] ?
      state.matrixData[(state.scenarios[state.active!].areas[state.activeArea!].id)] : null
);

export const selectScenarioNamesIndexed = createSelector(
    selectScenarioState,
    state => new Map(state.scenarios.map(s => [s.id, s.name]))
);

export const selectAutoBatch = createSelector(
  selectScenarioState,
  state => state.autoBatch
);
