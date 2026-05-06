import { metadataReducer, initialState } from './metadata.reducers';
import { MetadataActions, MetadataSelectors } from './';
import { ModelDescriptionDialogData } from '@src/app/map-view/band-selection/summary-model-selection/summary-model-dialog/summary-model-dialog.component';
import { UserActions } from '@data/user';
import { Baseline } from '@data/user/user.interfaces';

const MOCK_DESC: ModelDescriptionDialogData = {
  titleTranslationKey: 'test.title',
  steps: []
};

describe('metadata reducer — summary model descriptions', () => {
  it('fetchSummaryModelDescriptionsSuccess stores descriptions under the correct category', () => {
    const state = metadataReducer(
      initialState,
      MetadataActions.fetchSummaryModelDescriptionsSuccess({
        category: 'ECOSYSTEM',
        descriptions: { simple: MOCK_DESC }
      })
    );
    expect(state.availableSummaryModelDescriptions.ECOSYSTEM?.['simple']).toEqual(MOCK_DESC);
  });

  it('fetchSummaryModelDescriptionsSuccess for PRESSURE does not touch ECOSYSTEM', () => {
    const state = metadataReducer(
      initialState,
      MetadataActions.fetchSummaryModelDescriptionsSuccess({
        category: 'PRESSURE',
        descriptions: { simple: MOCK_DESC }
      })
    );
    expect(state.availableSummaryModelDescriptions.PRESSURE?.['simple']).toEqual(MOCK_DESC);
    expect(state.availableSummaryModelDescriptions.ECOSYSTEM).toBeNull();
  });
});

describe('metadata reducer — baseline change', () => {
  it('activeBaselineChanged resets availableSummaryModelDescriptions', () => {
    const populated = metadataReducer(
      initialState,
      MetadataActions.fetchSummaryModelDescriptionsSuccess({
        category: 'ECOSYSTEM',
        descriptions: { simple: MOCK_DESC }
      })
    );
    const state = metadataReducer(
      populated,
      UserActions.activeBaselineChanged({ baseline: { id: 9, name: 'B', description: '' } as Baseline })
    );
    expect(state.availableSummaryModelDescriptions).toEqual({ ECOSYSTEM: null, PRESSURE: null });
  });
});

describe('metadata selectors — summary model', () => {
  it('selectSummaryModelDescription returns the correct description', () => {
    const state = {
      ...initialState,
      availableSummaryModelDescriptions: {
        ECOSYSTEM: { simple: MOCK_DESC },
        PRESSURE: null
      }
    };

    const result = MetadataSelectors.selectSummaryModelDescription('ECOSYSTEM', 'simple')
      .projector(state);

    expect(result).toEqual(MOCK_DESC);
  });

  it('selectSummaryModelDescription returns null when category has no descriptions', () => {
    const state = { ...initialState };

    const result = MetadataSelectors.selectSummaryModelDescription('ECOSYSTEM', 'simple')
      .projector(state);

    expect(result).toBeNull();
  });

  it('selectSummaryModelDescription returns null for unknown model key', () => {
    const state = {
      ...initialState,
      availableSummaryModelDescriptions: {
        ECOSYSTEM: { simple: MOCK_DESC },
        PRESSURE: null
      }
    };

    const result = MetadataSelectors.selectSummaryModelDescription('ECOSYSTEM', 'nonexistent')
      .projector(state);

    expect(result).toBeNull();
  });
});
