import { createReducer, on } from '@ngrx/store';
import { setIn } from 'immutable';
import { State, Band, Groups, bandEquals } from './metadata.interfaces';
import { MetadataActions, MetadataInterfaces } from './';
import { ScenarioActions } from "@data/scenario";
import { getBandPath } from "@data/metadata/metadata.selectors";

export const initialState: MetadataInterfaces.State = {
  ECOSYSTEM: {},
  PRESSURE: {},
  visibleReliability: null
};

export const metadataReducer = createReducer(
  initialState,
  on(MetadataActions.fetchMetadataSuccess, (state, { metadata }) => ({
    ...state,
    ECOSYSTEM: metadata.ecoComponent,
    PRESSURE: metadata.pressureComponent
  })),
  on(MetadataActions.fetchSparseMetadataSuccess, (state, { metadata }) => {
    return {
      ...state,
      ECOSYSTEM: mapSelectedToState(state, metadata.ecoComponent).ECOSYSTEM,
      PRESSURE: mapSelectedToState(state, metadata.pressureComponent).PRESSURE
    }
  }),
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
    for (const groups of [...Object.values(state['ECOSYSTEM']), ...Object.values(state['PRESSURE'])]) {
      for (const gband of Object.values(groups.bands)) {
        if (!bandEquals(gband, band)) {
          state = setLayerAttribute(state, gband, 'visible', false);
        }
      }
    }
    return {
      ...state,
      visibleReliability: { band, opaque }
    }
  }),
  on(MetadataActions.hideReliability, (state) => ({
    ...state,
    visibleReliability: null
  })),
  on(ScenarioActions.closeActiveScenario, (state) => ({
    ...state,
    changeMap: {}
  })),
);

function setLayerAttribute(state: State, band: Band, attribute: string, value: unknown): State {
  // artificial "path" / hierarchy modeled on the previous implementation
  // TODO: Reimplement
  return setIn(state, [ ...getBandPath(band), attribute], value);
}

function getLayerAttribute<type>(state: State, band: Band, attribute: string): type {
  return state[band.symphonyCategory][band.meta.symphonytheme].bands[band.bandNumber][attribute as keyof Band] as type;
}

function mapSelectedToState(state: State, groups: Groups): State {
  for(const group of Object.values(groups)) {
    for(const band of Object.values(group.bands)) {
      state = setLayerAttribute(state, band, 'selected', band.selected);
    }
  }
  return state;
}
