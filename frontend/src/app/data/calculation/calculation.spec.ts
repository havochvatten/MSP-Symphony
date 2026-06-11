import { calculationReducer, initialState } from './calculation.reducers';
import { CalculationSlice, CompoundComparisonSlice } from './calculation.interfaces';
import { CalculationActions, CalculationSelectors } from './';
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
      percentileValue: 0.95,
      summaryModels: { ECOSYSTEM: 'simple' as const, PRESSURE: 'balanced' as const },
      summaryModelLoading: { ECOSYSTEM: true, PRESSURE: true },
      availableSummaryModels: { ECOSYSTEM: [{ key: 'simple', name: 'Simple model' }], PRESSURE: [{ key: 'balanced', name: 'Balanced model' }] }
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
    // Summary model selection and loading reset
    expect(_state.summaryModels).toEqual({ ECOSYSTEM: 'none', PRESSURE: 'none' });
    expect(_state.summaryModelLoading).toEqual({ ECOSYSTEM: false, PRESSURE: false });
    // availableSummaryModels preserved — cleared by fetchSummaryModels, not activeBaselineChanged
    expect(_state.availableSummaryModels).toEqual({ ECOSYSTEM: [{ key: 'simple', name: 'Simple model' }], PRESSURE: [{ key: 'balanced', name: 'Balanced model' }] });
  });
});

describe('calculation reducer — summary model actions', () => {
  it('setSummaryModel updates the correct category, leaving other unchanged', () => {
    const state = calculationReducer(
      initialState,
      CalculationActions.setSummaryModel({ category: 'ECOSYSTEM', model: 'simple' })
    );
    expect(state.summaryModels.ECOSYSTEM).toEqual('simple');
    expect(state.summaryModels.PRESSURE).toEqual('none'); // unchanged
  });

  it('setSummaryModel for PRESSURE does not touch ECOSYSTEM', () => {
    const state = calculationReducer(
      initialState,
      CalculationActions.setSummaryModel({ category: 'PRESSURE', model: 'balanced' })
    );
    expect(state.summaryModels.PRESSURE).toEqual('balanced');
    expect(state.summaryModels.ECOSYSTEM).toEqual('none');
  });

  it('setSummaryModelLoading sets loading flag for category', () => {
    const state = calculationReducer(
      initialState,
      CalculationActions.setSummaryModelLoading({ category: 'ECOSYSTEM', loading: true })
    );
    expect(state.summaryModelLoading.ECOSYSTEM).toBeTrue();
    expect(state.summaryModelLoading.PRESSURE).toBeFalse();
  });

  it('fetchSummaryModels clears availableSummaryModels for the requested category', () => {
    const populated = {
      ...initialState,
      availableSummaryModels: { ECOSYSTEM: [{ key: 'simple', name: 'Simple model' }, { key: 'balanced', name: 'Balanced model' }], PRESSURE: [{ key: 'simple', name: 'Simple model' }] }
    };
    const state = calculationReducer(
      populated,
      CalculationActions.fetchSummaryModels({ baselineName: 'B', category: 'ECOSYSTEM' })
    );
    expect(state.availableSummaryModels.ECOSYSTEM).toEqual([]);
    expect(state.availableSummaryModels.PRESSURE).toEqual([{ key: 'simple', name: 'Simple model' }]); // unchanged
  });

  it('fetchSummaryModelsSuccess populates availableSummaryModels', () => {
    const state = calculationReducer(
      initialState,
      CalculationActions.fetchSummaryModelsSuccess({
        baselineName: 'BASELINE2019',
        category: 'ECOSYSTEM',
        models: [{ key: 'simple', name: 'Simple model' }, { key: 'balanced', name: 'Balanced model' }]
      })
    );
    expect(state.availableSummaryModels.ECOSYSTEM).toEqual([{ key: 'simple', name: 'Simple model' }, { key: 'balanced', name: 'Balanced model' }]);
    expect(state.availableSummaryModels.PRESSURE).toEqual([]); // unchanged
  });
});

describe('calculation selectors — summary model', () => {
  const state = {
    ...initialState,
    availableSummaryModels: { ECOSYSTEM: [{ key: 'simple', name: 'Simple model' }, { key: 'balanced', name: 'Balanced model' }], PRESSURE: [{ key: 'simple', name: 'Simple model' }] },
    summaryModels: { ECOSYSTEM: 'simple', PRESSURE: 'none' },
    summaryModelLoading: { ECOSYSTEM: true, PRESSURE: false }
  };

  it('selectAvailableSummaryModels returns models for category', () => {
    expect(CalculationSelectors.selectAvailableSummaryModels('ECOSYSTEM').projector(state))
      .toEqual([{ key: 'simple', name: 'Simple model' }, { key: 'balanced', name: 'Balanced model' }]);
    expect(CalculationSelectors.selectAvailableSummaryModels('PRESSURE').projector(state))
      .toEqual([{ key: 'simple', name: 'Simple model' }]);
  });

  it('selectVisibleSummaryModels returns the summaryModels map', () => {
    expect(CalculationSelectors.selectVisibleSummaryModels.projector(state))
      .toEqual({ ECOSYSTEM: 'simple', PRESSURE: 'none' });
  });

  it('selectSummaryModelLoading returns loading flag for category', () => {
    expect(CalculationSelectors.selectSummaryModelLoading('ECOSYSTEM').projector(state)).toBeTrue();
    expect(CalculationSelectors.selectSummaryModelLoading('PRESSURE').projector(state)).toBeFalse();
  });
});
