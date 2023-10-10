import { createReducer, on } from '@ngrx/store';
import { setIn, updateIn } from "immutable";
import { CalculationActions, CalculationInterfaces } from './';
import { AreaActions } from '@data/area';
import { Legend } from "@data/calculation/calculation.interfaces";
import { ListItemsSort } from "@data/common/sorting.interfaces";

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
    comparison: {}
  },
  sortCalculations: ListItemsSort.None,
  batchProcesses: [],
  visibleResults: []
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
    legends: setIn(state.legends, [legendType], legend)
  })),
  on(CalculationActions.fetchComparisonLegendSuccess, (state, { legend, comparisonTitle, maxValue }) => {
    const comparisonTitles= new Set(state.legends.comparison[maxValue.toString()]?.title || []);
          comparisonTitles.add(comparisonTitle);
    return updateComparisonLegend(state, maxValue.toString(), [...comparisonTitles], legend);
  }),
  on(CalculationActions.resetComparisonLegend, (state) => ({
    ...state,
    legends: setIn(state.legends, ['comparison'], {})
  })),
  on(CalculationActions.updateName, (state, { index, newName }) => ({
    ...state,
    calculations: setIn(state.calculations, [index, 'name'], newName)
  })),
  on(CalculationActions.fetchPercentileSuccess, (state, { percentileValue }) => ({
    ...state,
    percentileValue: percentileValue
  })),
  on(CalculationActions.setCalculationSortType, (state, { sortType }) => ({
    ...state,
    sortCalculations: sortType
  })),
  on(CalculationActions.updateBatchProcess, (state, { id, process }) => ({
    ...state,
    batchProcesses: setIn(state.batchProcesses, [id], process)
  })),
  on(CalculationActions.removeBatchProcessSuccess, (state, { id }) => ({
    ...state,
    batchProcesses: setIn(state.batchProcesses, [id], undefined)
  })),
  on(CalculationActions.cancelBatchProcessSuccess, (state, { id }) => ({
    ...state,
    batchProcesses: setIn(state.batchProcesses, [id], {...state.batchProcesses[id], cancelled: true})
  })),
  on(CalculationActions.setVisibleResultLayers, (state, { visibleResults }) => ({
    ...state,
    visibleResults: visibleResults,
    calculations: state.calculations.map(c => ({...c, isPurged: !(visibleResults.includes(c.id) || !c.isPurged)}))
                                                      // unnecessary to sync, visible results cannot be "purged"
  })),
);

function updateComparisonLegend(state: CalculationInterfaces.State, maxValueKey:string, comparisonTitles: string[], legend: Legend): CalculationInterfaces.State {
    return setIn(state, ['legends', 'comparison', maxValueKey], { title: comparisonTitles, legend: legend });
}
