import { createReducer, on } from '@ngrx/store';
import { CalculationActions, CalculationInterfaces } from './';
import { AreaActions } from '@data/area';
import { setIn } from "immutable";

export const initialState: CalculationInterfaces.State = {
  loadingReport: false,
  calculations: [],
  loadingCalculations: false,
  calculating: false,
  percentileValue: 0,
  legends: {
    result: undefined,
    ecosystem: undefined,
    pressure: undefined,
    comparison: undefined
  }
};

export const calculationReducer = createReducer(
  initialState,
  on(CalculationActions.startCalculation, state => ({
    ...state,
    calculating: true
  })),
  on(CalculationActions.calculationSucceeded, (state, { calculation }) => ({
    ...state,
    calculations: [calculation, ...state.calculations],
    calculating: false
  })),
  on(CalculationActions.calculationFailed, state => ({
    ...state,
    calculating: false
  })),
  on(CalculationActions.fetchCalculations, state => ({
    ...state,
    loadingCalculations: true
  })),
  on(CalculationActions.fetchCalculationsSuccess, (state, { calculations }) => ({
    ...state,
    calculations,
    loadingCalculations: false
  })),
  on(AreaActions.updateSelectedArea, (state, _) => ({
    ...state,
    calculating: false,
    latestCalculationId: undefined
  })),
  on(CalculationActions.fetchLegendSuccess, (state, { legend, legendType }) => ({
    ...state,
    legends: {
      ...state.legends,
      [legendType]: legend
    }
  })),
  on(CalculationActions.updateName, (state, { index, newName }) => ({
    ...state,
    calculations: setIn(state.calculations, [index, 'name'], newName)
  })),
  on(CalculationActions.fetchPercentileSuccess, (state, { percentileValue }) => ({
    ...state,
    percentileValue: percentileValue
  }))
);
