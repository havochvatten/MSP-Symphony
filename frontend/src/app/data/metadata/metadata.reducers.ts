import { createReducer, on } from '@ngrx/store';
import { setIn, updateIn } from 'immutable';
import { State, Band, Groups } from './metadata.interfaces';
import { MetadataActions, MetadataInterfaces } from './';
import { ScenarioActions } from "@data/scenario";
import { getBandPath } from "@data/metadata/metadata.selectors";

export const initialState: MetadataInterfaces.State = {
  ECOSYSTEM: {},
  PRESSURE: {}
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
      ECOSYSTEM: mapSelectedToState(state, metadata.ecoComponent).ECOSYSTEM,
      PRESSURE: mapSelectedToState(state, metadata.pressureComponent).PRESSURE
    }
  }),
  on(MetadataActions.selectBand, (state, { band, value }) => {
    return setLayerAttribute(state, band, 'selected', value);
  }),
  on(MetadataActions.setVisibility, (state, { band, value }) => {
    return setLayerAttribute(state, band, 'visible', value);
  }),
  on(MetadataActions.setLoadedState, (state, { band, value }) => {
    return setLayerAttribute(state, band, 'loaded', value);
  }),
  on(MetadataActions.updateLayerOpacity, (state, { band, value }) => {
    return setIn(state, [band.symphonyCategory, 'layerOpacity'], value);
  }),
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

function mapSelectedToState(state: State, groups: Groups): State {
  for(const group of Object.values(groups)) {
    for(const band of Object.values(group.bands)) {
      state = setLayerAttribute(state, band, 'selected', band.selected);
    }
  }
  return state;
}
