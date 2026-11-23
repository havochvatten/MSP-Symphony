import { createReducer, on } from '@ngrx/store';
import { setIn } from 'immutable';
import { Band, bandEquals, BandType, Groups, State } from './metadata.interfaces';
import { MetadataActions, MetadataInterfaces } from './';
import { ScenarioActions } from '@data/scenario';
import { UserActions } from '@data/user';

export const initialState: MetadataInterfaces.State = {
  ECOSYSTEM: {},
  PRESSURE: {},
  visibleReliability: null,
  loading: false,
  availableSummaryModelDescriptions: {
    ECOSYSTEM: null,
    PRESSURE: null
  }
};

export const metadataReducer = createReducer(
  initialState,
  on(MetadataActions.fetchMetadataSuccess, (state, { metadata }) => ({
    ...state,
    ECOSYSTEM: metadata.ecoComponent,
    PRESSURE: metadata.pressureComponent
  })),
  on(MetadataActions.fetchSparseMetadataSuccess, (state, { metadata }) =>
    mergeSparseMetadata(state, metadata)
  ),
  on(MetadataActions.selectBand, (state, { band, value }) => {
    return setLayerAttribute(state, band, 'selected', value);
  }),
  on(MetadataActions.setVisibility, (state, { band, value }) => {
    if (state.visibleReliability) {
      if (bandEquals(state.visibleReliability.band, band)) {
        state = setIn(state, ['visibleReliability', 'opaque'], !value);
      } else if (value) {
        state = {
          ...state,
          visibleReliability: null
        };
      }
    }
    return setLayerAttribute(state, band, 'visible', value);
  }),
  on(MetadataActions.selectBandsByType, (state, { bandType, value }) => {
    for (const group of Object.values(state[bandType])) {
      for (const band of Object.values(group.bands)) {
        state = setLayerAttribute(state, band, 'selected', value);
      }
    }
    return state;
  }),
  on(MetadataActions.setLoadedState, (state, { band, value }) => {
    return setLayerAttribute(state, band, 'loaded', value);
  }),
  on(MetadataActions.showReliability, (state, { band }) => {
    const opaque: boolean = !getLayerAttribute(state, band, 'visible');
    for (const groups of [
      ...Object.values(state['ECOSYSTEM']),
      ...Object.values(state['PRESSURE'])
    ]) {
      for (const gband of Object.values(groups.bands)) {
        if (!bandEquals(gband, band)) {
          state = setLayerAttribute(state, gband, 'visible', false);
        }
      }
    }
    return {
      ...state,
      visibleReliability: { band, opaque }
    };
  }),
  on(MetadataActions.hideReliability, (state) => ({
    ...state,
    visibleReliability: null
  })),
  on(ScenarioActions.closeActiveScenario, (state) => ({
    ...state,
    changeMap: {}
  })),
  // Indicate loading state
  on(MetadataActions.fetchMetadataForBaseline, (state) => ({
    ...state,
    loading: true
  })),
  // Reset loading state on success (full or sparse) / failure
  on(
    MetadataActions.fetchMetadataSuccess,
    MetadataActions.fetchSparseMetadataSuccess,
    MetadataActions.fetchMetadataFailure,
    (state) => ({
      ...state,
      loading: false
    })
  ),
  on(MetadataActions.fetchSummaryModelDescriptionsSuccess, (state, { category, descriptions }) => ({
    ...state,
    availableSummaryModelDescriptions: {
      ...state.availableSummaryModelDescriptions,
      [category]: descriptions
    }
  })),
  on(UserActions.activeBaselineChanged, (state) => ({
    ...state,
    availableSummaryModelDescriptions: { ECOSYSTEM: null, PRESSURE: null }
  }))
);

// Theme names are translated, so a band is addressed by its category and number. The theme key
// is looked up in the current state.
function findBandPath(
  state: State,
  category: BandType,
  bandNumber: number
): [BandType, string, 'bands', number] | undefined {
  const theme = Object.keys(state[category]).find(
    (key) => state[category][key].bands[bandNumber] !== undefined
  );
  return theme === undefined ? undefined : [category, theme, 'bands', bandNumber];
}

function findBand(state: State, category: BandType, bandNumber: number): Band | undefined {
  const path = findBandPath(state, category, bandNumber);
  return path ? state[path[0]][path[1]].bands[path[3]] : undefined;
}

// The scenario payload is sparse: it only carries theme names, titles and the selection, in the
// current language. The incoming groups define the theme keys; everything else on a band
// (reliability, the remaining meta fields, visible, loaded) is kept from the earlier load.
function mergeSparseMetadata(
  state: State,
  metadata: { ecoComponent: Groups; pressureComponent: Groups }
): State {
  const mergeGroups = (groups: Groups): Groups =>
    Object.fromEntries(
      Object.entries(groups).map(([theme, group]) => [
        theme,
        {
          ...group,
          bands: Object.fromEntries(
            Object.entries(group.bands).map(([key, band]) => [key, mergeBand(state, band)])
          )
        }
      ])
    );

  return {
    ...state,
    ECOSYSTEM: mergeGroups(metadata.ecoComponent),
    PRESSURE: mergeGroups(metadata.pressureComponent)
  };
}

function mergeBand(state: State, band: Band): Band {
  const old: Band | undefined = findBand(state, band.symphonyCategory, band.bandNumber);
  if (!old) return band;
  const merged: Band = {
    ...old,
    title: band.title,
    displayName: band.displayName ?? band.title,
    selected: band.selected,
    meta: { ...old.meta, ...band.meta }
  };
  return merged;
}

function setLayerAttribute(state: State, band: Band, attribute: string, value: unknown): State {
  // An unknown band (for example an object from before a reload) is ignored on purpose.
  const path = findBandPath(state, band.symphonyCategory, band.bandNumber);
  return path ? setIn(state, [...path, attribute], value) : state;
}

function getLayerAttribute<type>(state: State, band: Band, attribute: string): type | undefined {
  const found = findBand(state, band.symphonyCategory, band.bandNumber);
  return found ? (found[attribute as keyof Band] as type) : undefined;
}
