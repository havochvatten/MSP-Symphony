import { calculationReducer, initialState } from './calculation.reducers';
import { CalculationSlice, CompoundComparisonSlice } from './calculation.interfaces';
import { UserActions } from '@data/user';
import { Baseline } from '@data/user/user.interfaces';

const baseline: Baseline = { id: 9, name: 'B', description: '' } as Baseline;

describe('CalculationReducer', () => {
  it('clears all per-baseline arrays on activeBaselineChanged but keeps sort/legend/percentile', () => {
    const populated = {
      ...initialState,
      calculations: [{ id: 1, name: 'c1' } as unknown as CalculationSlice],
      batchProcesses: { 1: { } as never },
      compoundComparisons: [{ id: 7 } as unknown as CompoundComparisonSlice],
      visibleResults: [1, 2],
      loadingResults: [3],
      loadingReports: [4],
      generatingComparisonsFor: [5, 6],
      compoundComparisonSuccessCount: 3,
      percentileValue: 0.95
    };

    const _state = calculationReducer(populated, UserActions.activeBaselineChanged({ baseline }));

    expect(_state.calculations).toEqual([]);
    expect(_state.batchProcesses).toEqual([] as never);
    expect(_state.compoundComparisons).toEqual([]);
    expect(_state.visibleResults).toEqual([]);
    expect(_state.loadingResults).toEqual([]);
    expect(_state.loadingReports).toEqual([]);
    expect(_state.generatingComparisonsFor).toEqual([]);
    expect(_state.compoundComparisonSuccessCount).toEqual(0);
    // Preserved by design
    expect(_state.percentileValue).toEqual(0.95);
    expect(_state.sortCalculations).toEqual(populated.sortCalculations);
  });
});
