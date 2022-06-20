import { createReducer, on } from "@ngrx/store";
import { ScenarioActions, ScenarioInterfaces } from "@data/scenario/index";
import { CalculationActions } from "@data/calculation";
import { removeIn, setIn, updateIn } from "immutable";
import { Feature, GeoJsonProperties } from "geojson";
import { AreaActions} from "@data/area";
import { Polygon } from "@data/area/area.interfaces";
import { fetchAreaMatrices, fetchAreaMatricesFailure, fetchAreaMatricesSuccess } from "@data/scenario/scenario.actions";
import { isEqual } from "lodash";

export const initialState: ScenarioInterfaces.State = {
  scenarios: [],
  active: undefined,
  activeFeature: undefined,
  matricesLoading: false
};

export const scenarioReducer = createReducer(
  initialState,
  on(ScenarioActions.fetchScenariosSuccess, (state, { scenarios }) => ({
    ...state,
    scenarios
  })),
  on(ScenarioActions.openScenario, (state, { scenario, index }) => ({
    ...state,
    active: index,
    scenarios: updateIn(state.scenarios, [index, 'changes', 'features'], (features: Feature[]) =>
      features.map(feature => setIn(feature, ['properties', 'visible'], true)))
  })),
  on(ScenarioActions.closeActiveScenario, (state) => ({
    ...state,
    active: undefined,
    activeFeature: undefined
  })),
  on(ScenarioActions.addScenario, (state, { scenario }) => ({
    ...state,
    scenarios: [scenario, ...state.scenarios], // prepend, since it will be newest
    active: 0,
  })),
  on(ScenarioActions.deleteScenario, (state, _) => ({
    ...state,
    scenarios: removeIn(state.scenarios, [state.active]),
    // Optimistically close scenario to reduce latency
    active: undefined,
    activeFeature: undefined
  })),
  on(CalculationActions.calculationSucceeded, (state, { calculation }) => ({
    ...state,
    scenarios: setIn(state.scenarios, [state.active, 'latestCalculation'], calculation.id)
  })),
  on(ScenarioActions.changeScenarioName, (state, { name }) => ({
    ...state,
    scenarios: setIn(state.scenarios, [state.active, 'name'], name)
  })),
  on(ScenarioActions.changeScenarioAttribute, (state, { attribute, value }) => ({
    ...state,
    scenarios: setIn(state.scenarios, [state.active, attribute], value)
  })),
  on(AreaActions.updateSelectedArea, (state, { statePath }) => {
    if (state.active === undefined)
      return state;
    else {
      const featureIndex = state.scenarios[state.active].changes.features.findIndex((f: Feature) =>
        isEqual(f.properties!.statePath, statePath)); // or just check id?
      return {
        ...state,
        activeFeature: featureIndex !== -1 ? featureIndex : undefined
      }
    }
  }),
  on(ScenarioActions.updateBandAttribute, (state, { area, componentType, bandId, band, attribute, value }) => {
    const featureIndex = state.activeFeature ?? // activeFeature is wrong!
      state.scenarios[state.active!].changes.features.findIndex((f: Feature) =>
          f!.id == area.feature.properties.id);

    if (featureIndex == -1) {
      const isWholeScenarioFeature = area.feature.properties.id == state.scenarios[state.active!].feature.properties?.id;
      const featureToBeAdded = createGeoJSONFeature(area.polygon, area.feature.properties.id, {
        title: area?.name,
        visible: true,
        displayName: area?.displayName,
        statePath: area.statePath, // perhaps useful
        changes: {
          [bandId]: {
            type: componentType,
            band: band,
            [attribute]: value
          }
        }
      });

      return {
        ...state,
        scenarios: updateIn(state.scenarios, [state.active, 'changes', 'features'],
          features => isWholeScenarioFeature ?
            [featureToBeAdded, ...features] :
            [...features, featureToBeAdded]),
        activeFeature: isWholeScenarioFeature ? 0 : state.scenarios[state.active!].changes.features.length-1+1
      }
    }
    else
      return {
      ...state,
        // TODO delete if all area changes are neutral?
        scenarios: updateIn(state.scenarios, [state.active, 'changes', 'features', featureIndex,
          'properties', 'changes', bandId], change => ({
          ...change,
          type: componentType,
          band: band,
          [attribute]: value
        })),
        activeFeature: featureIndex
      }
  }),
  on(ScenarioActions.deleteBandChangeAttribute, (state, { featureIndex, bandId }) => ({
    ...state,
    scenarios: removeIn(state.scenarios, [state.active, 'changes', 'features', featureIndex, 'properties', 'changes', bandId])
  })),
  on(ScenarioActions.setChangeAreaVisibility, (state, { featureIndex, visible }) => ({
    ...state,
    scenarios: setIn(state.scenarios, [state.active, 'changes', 'features', featureIndex,
      'properties', 'visible'], visible)
  })),
  on(ScenarioActions.hideAllChangeAreas, (state, {  }) => ({
    ...state,
    scenarios: updateIn(state.scenarios, [state.active, 'changes', 'features'], (features: Feature[]) =>
      features.map(feature => setIn(feature, ['properties', 'visible'], false))
    )
  })),
  on(ScenarioActions.deleteChangeFeature, (state, { featureIndex }) => ({
    ...state,
    scenarios: removeIn(state.scenarios, [state.active, 'changes', 'features', featureIndex])
  })),
  on(fetchAreaMatrices, (state, {geometry}) => ({
    ...state,
    matricesLoading: true
  })),
  on(fetchAreaMatricesSuccess, (state, { matrixData }) => ({
    ...state,
    matricesLoading: false
  })),
  on(fetchAreaMatricesFailure, state  => ({
    ...state,
    matricesLoading: false
  })),
);

function createGeoJSONFeature(geometry: Polygon, id: string | number, properties: GeoJsonProperties) {
  return {
    type: "Feature",
    geometry,
    id,
    properties
  };
}
