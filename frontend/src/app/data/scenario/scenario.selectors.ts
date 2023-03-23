import { createFeatureSelector, createSelector } from "@ngrx/store";
import { State as AppState } from "@src/app/app-reducer";
import { State } from "@data/scenario/scenario.interfaces";

export const selectScenarioState = createFeatureSelector<AppState, State>('scenario');

export const selectScenarios = createSelector(
  selectScenarioState,
  (state) => state.scenarios
);

export const selectActiveScenario = createSelector(
  selectScenarioState,
  (state) => state?.active !== undefined ? state?.scenarios[state?.active] : undefined
);

export const selectActiveScenarioChangeFeatures = createSelector(
  selectActiveScenario,
  (scenario) => scenario?.changes.features
);

export const selectActiveFeature = createSelector(
  selectScenarioState,
  (state) =>
      state.active !== undefined &&
      state.activeFeature !== undefined &&
      state.scenarios[state.active].changes.features !== undefined ?
    state.scenarios[state.active].changes.features[state.activeFeature] :
    undefined
);

export const selectActiveScenarioFeatureChanges = createSelector(
  selectActiveFeature,
  (feature) => feature?.properties?.['changes'] ?? {}
);

export const selectAreaMatrixDataLoading = createSelector(
  selectScenarioState,
  state => state.matricesLoading
);
