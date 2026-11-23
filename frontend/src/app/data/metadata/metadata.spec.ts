import { metadataReducer, initialState } from './metadata.reducers';
import { MetadataActions, MetadataSelectors } from './';
import { Band, Groups, State } from './metadata.interfaces';
import { ModelDescriptionDialogData } from '@src/app/map-view/band-selection/summary-model-selection/summary-model-dialog/summary-model-dialog.component';
import { UserActions } from '@data/user';
import { Baseline } from '@data/user/user.interfaces';

const emptyMeta = { ecoComponent: {} as Groups, pressureComponent: {} as Groups };

const MOCK_DESC: ModelDescriptionDialogData = {
  title: 'Test title',
  steps: []
};

describe('MetadataReducer', () => {
  const loadingState = () =>
    metadataReducer(initialState, MetadataActions.fetchMetadataForBaseline({ baselineName: 'B' }));

  it('sets loading true on fetchMetadataForBaseline', () => {
    expect(loadingState().loading).toBe(true);
  });

  it('resets loading on fetchMetadataSuccess', () => {
    const done = metadataReducer(
      loadingState(),
      MetadataActions.fetchMetadataSuccess({ metadata: emptyMeta })
    );
    expect(done.loading).toBe(false);
  });

  it('resets loading on fetchSparseMetadataSuccess', () => {
    const done = metadataReducer(
      loadingState(),
      MetadataActions.fetchSparseMetadataSuccess({ metadata: emptyMeta })
    );
    expect(done.loading).toBe(false);
  });

  it('resets loading on fetchMetadataFailure', () => {
    const done = metadataReducer(
      loadingState(),
      MetadataActions.fetchMetadataFailure({ error: { status: 500, message: 'boom' } })
    );
    expect(done.loading).toBe(false);
  });
});

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
      UserActions.activeBaselineChanged({
        baseline: { id: 9, name: 'B', description: '' } as Baseline
      })
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

    const result = MetadataSelectors.selectSummaryModelDescription('ECOSYSTEM', 'simple').projector(
      state
    );

    expect(result).toEqual(MOCK_DESC);
  });

  it('selectSummaryModelDescription returns null when category has no descriptions', () => {
    const state = { ...initialState };

    const result = MetadataSelectors.selectSummaryModelDescription('ECOSYSTEM', 'simple').projector(
      state
    );

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

    const result = MetadataSelectors.selectSummaryModelDescription(
      'ECOSYSTEM',
      'nonexistent'
    ).projector(state);

    expect(result).toBeNull();
  });
});

function groupsFor(
  category: 'ECOSYSTEM' | 'PRESSURE',
  theme: string,
  title: string,
  overrides: Partial<Band> = {}
): Groups {
  return {
    [theme]: {
      symphonyThemeName: theme,
      bands: {
        // displayName mirrors what MetadataEffects.formatComponentData adds to each band
        1: {
          title,
          displayName: title,
          bandNumber: 1,
          symphonyCategory: category,
          selected: false,
          reliability: null,
          ...overrides,
          meta: { title, symphonytheme: theme, ...overrides.meta }
        } as Band
      }
    }
  };
}

const ecoGroupsFor = (theme: string, title: string, overrides: Partial<Band> = {}): Groups =>
  groupsFor('ECOSYSTEM', theme, title, overrides);

const pressureGroupsFor = (theme: string, title: string): Groups =>
  groupsFor('PRESSURE', theme, title);

describe('metadata after a language switch in a scenario', () => {
  const svLoad = (overrides: Partial<Band> = {}) =>
    MetadataActions.fetchMetadataSuccess({
      metadata: {
        ecoComponent: ecoGroupsFor('Fågel', 'Kustfågel', overrides),
        pressureComponent: pressureGroupsFor('Yrkesfiske', 'Bottentrål skavning')
      }
    });

  const enLoad = MetadataActions.fetchSparseMetadataSuccess({
    metadata: {
      ecoComponent: ecoGroupsFor('Birds', 'Coastal bird'),
      pressureComponent: pressureGroupsFor('Fishing', 'Abrasion bottom trawl')
    }
  });

  const frLoad = MetadataActions.fetchSparseMetadataSuccess({
    metadata: {
      ecoComponent: ecoGroupsFor('Oiseaux', 'Oiseau côtier'),
      pressureComponent: pressureGroupsFor('Pêche', 'Abrasion chalut de fond')
    }
  });

  const svBand = (): Band => ecoGroupsFor('Fågel', 'Kustfågel')['Fågel'].bands[1];

  const reliabilityMap = (state: State) =>
    MetadataSelectors.selectReliabilityMap({ metadata: state } as never);

  it('keeps every band readable by selectReliabilityMap', () => {
    const state = metadataReducer(metadataReducer(initialState, svLoad()), enLoad);

    expect(() => reliabilityMap(state)).not.toThrow();
  });

  it('takes theme names and band titles from the new language', () => {
    const state = metadataReducer(metadataReducer(initialState, svLoad()), enLoad);

    expect(Object.keys(state.ECOSYSTEM)).toEqual(['Birds']);
    expect(Object.keys(state.PRESSURE)).toEqual(['Fishing']);
    expect(state.ECOSYSTEM['Birds'].symphonyThemeName).toBe('Birds');
    expect(state.ECOSYSTEM['Birds'].bands[1].title).toBe('Coastal bird');
    expect(state.ECOSYSTEM['Birds'].bands[1].meta['symphonytheme']).toBe('Birds');
    expect(state.ECOSYSTEM['Birds'].bands[1].displayName).toBe('Coastal bird');
  });

  it('keeps visible and loaded across a language switch', () => {
    let state = metadataReducer(initialState, svLoad());
    state = metadataReducer(state, MetadataActions.setVisibility({ band: svBand(), value: true }));
    state = metadataReducer(state, MetadataActions.setLoadedState({ band: svBand(), value: true }));
    state = metadataReducer(state, enLoad);

    const band = state.ECOSYSTEM['Birds'].bands[1];
    expect(band.visible).toBe(true);
    expect(band.loaded).toBe(true);
  });

  it('survives repeated switches', () => {
    const reliability = { partitions: [] };
    let state = metadataReducer(
      initialState,
      svLoad({ reliability, meta: { authorOrganisation: 'Havs- och vattenmyndigheten' } })
    );
    state = metadataReducer(state, MetadataActions.setVisibility({ band: svBand(), value: true }));
    state = metadataReducer(state, MetadataActions.setLoadedState({ band: svBand(), value: true }));

    for (const [load, theme, title] of [
      [enLoad, 'Birds', 'Coastal bird'],
      [frLoad, 'Oiseaux', 'Oiseau côtier']
    ] as const) {
      state = metadataReducer(state, load);

      expect(() => reliabilityMap(state)).not.toThrow();
      expect(Object.keys(state.ECOSYSTEM)).toEqual([theme]);
      expect(Object.keys(state.PRESSURE).length).toBe(1);
      const band = state.ECOSYSTEM[theme].bands[1];
      expect(band.title).toBe(title);
      expect(band.displayName).toBe(title);
      expect(band.reliability).toEqual(reliability);
      expect(band.meta['authorOrganisation']).toBe('Havs- och vattenmyndigheten');
      expect(band.visible).toBe(true);
      expect(band.loaded).toBe(true);
    }
  });

  it('applies an update from an old-language band object to the current band', () => {
    let state = metadataReducer(metadataReducer(initialState, svLoad()), enLoad);
    state = metadataReducer(state, MetadataActions.selectBand({ band: svBand(), value: true }));

    expect(state.ECOSYSTEM['Birds'].bands[1].selected).toBe(true);
    expect(Object.keys(state.ECOSYSTEM)).not.toContain('Fågel');
  });

  it('keeps reliability and full metadata from the earlier load', () => {
    const reliability = { partitions: [] };
    let state = metadataReducer(
      initialState,
      svLoad({ reliability, meta: { authorOrganisation: 'Havs- och vattenmyndigheten' } })
    );
    state = metadataReducer(state, enLoad);

    const band = state.ECOSYSTEM['Birds'].bands[1];
    expect(band.reliability).toEqual(reliability);
    expect(band.meta['authorOrganisation']).toBe('Havs- och vattenmyndigheten');
    expect(band.meta['title']).toBe('Coastal bird');
    expect(band.title).toBe('Coastal bird');
  });
});
