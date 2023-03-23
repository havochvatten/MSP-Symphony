import { createReducer, on } from '@ngrx/store';
import { setIn } from 'immutable';
import { Selection, State } from './metadata.interfaces';
import { MetadataActions, MetadataInterfaces } from './';
import { ScenarioActions } from "@data/scenario";

export const initialState: MetadataInterfaces.State = {
  ecoComponent: {},
  pressureComponent: {}
};

export const metadataReducer = createReducer(
  initialState,
  on(MetadataActions.fetchMetadataSuccess, (state, { metadata }) => ({
    ...state,
    ...metadata
  })),
  on(MetadataActions.updateSelections, (state, { selections }) => {
    return updateSelections(state, selections, 'selected');
  }),
  on(MetadataActions.updateVisible, (state, { selections }) => {
    return updateSelections(state, selections, 'visible');
  }),
  on(MetadataActions.updateLayerOpacity, (state, { bandPath, value }) => {
    return setIn(state, [...bandPath, 'layerOpacity'], value);
  }),
  on(ScenarioActions.closeActiveScenario, (state) => ({
    ...state,
    changeMap: {}
  }))
);

function updateSelections(state: State, selections: Selection[], attribute: string): State {
  if (!selections.length)
    return state;

  const selection = selections[0];
  const updatedState = setIn(state, [...selection.statePath, attribute], selection.value);
  return updateSelections(updatedState, selections.slice(1), attribute);
}
