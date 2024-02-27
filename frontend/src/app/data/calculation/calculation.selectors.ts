import { State, LegendState, CompoundComparisonItem } from './calculation.interfaces';
import { State as AppState } from '@src/app/app-reducer';
import { createSelector, createFeatureSelector } from '@ngrx/store';
import { MetadataSelectors } from '@data/metadata';
import { sortFuncMap } from "@data/common/sorting.interfaces";

export const selectCalculationState = createFeatureSelector<AppState, State>('calculation');

export const selectLoadingReport = createSelector(
  selectCalculationState,
  state => state.loadingReport
);

export const selectCalculations = createSelector(
  selectCalculationState,
  state => {
    return [...state.calculations].sort(sortFuncMap[state.sortCalculations]);
  }
);

export const selectChangedCalculations = createSelector(
  selectCalculationState,
  state => state.calculations.filter(c => c.hasChanges)
);

export const selectComparedCalculations = createSelector(
  selectCalculationState,
  state => state.generatingComparisonsFor
);

export const selectLoadingCalculations = createSelector(
  selectCalculationState,
  state => state.loadingCalculations
);

export const selectCalculating = createSelector(
  selectCalculationState,
  state => state.calculating
);

export const selectLegends = createSelector(
  selectCalculationState,
  state => state.legends
);

export const selectComparisonLegend = createSelector(
  selectCalculationState,
  state => [...Object.values(state.legends.comparison)]
);

export const selectPercentileValue = createSelector(
  selectCalculationState,
  state => state.percentileValue
);

export const selectVisibleResults = createSelector(
  selectCalculationState,
  state => state.visibleResults
);

export const selectCalculationLoadingState = createSelector(
  selectCalculationState,
  state => ({
    loadingResults: state.loadingResults,
    loadingReports: state.loadingReports
    })
);

export const selectVisibleLegends = createSelector(
  selectLegends,
  MetadataSelectors.selectVisibleBands,
  (legends, visibleBands): LegendState => ({
    result: legends.result,
    comparison: legends.comparison,
    ecosystem: visibleBands.ecoComponent.length > 0 ? legends.ecosystem : undefined,
    pressure: visibleBands.pressureComponent.length > 0 ? legends.pressure : undefined
  })
);

export const selectBatchProcesses = createSelector(
  selectCalculationState,
  state => [...Object.values(state.batchProcesses)].filter(p => p !== undefined)
);

export const selectCompoundComparisons = createSelector(
  selectCalculationState,
  state => [...state.compoundComparisons].sort(sortFuncMap[state.sortCompoundComparisons]).map(c => new CompoundComparisonItem(c))
);

export const selectCompoundComparisonCount = createSelector(
  selectCompoundComparisons,
  compoundComparisons => compoundComparisons.length
);
