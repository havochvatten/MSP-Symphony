import { createReducer, on } from '@ngrx/store';
import { AreaActions, AreaInterfaces } from './';
import { getIn, setIn, updateIn } from 'immutable';
import { ScenarioActions } from '@data/scenario';
import { MatrixRef } from "@src/app/map-view/scenario/scenario-area-detail/matrix-selection/matrix.interfaces";
import { turfIntersects as intersects } from "@shared/turf-helper/turf-helper";
import { olFeatureEquals } from "@shared/common.util";
import Feature from "ol/Feature";
import { GeoJSON } from "ol/format";

export const initialState: AreaInterfaces.State = {
  areaTypes: [],
  area: {},
  userArea: {},
  boundaries: [],
  currentSelection: [],
  selectionOverlap: false,
  calibratedCalculationAreas: [],
};

export const areaReducer = createReducer(
  initialState,
  on(AreaActions.fetchNationalAreaTypesSuccess, (state, { areaTypes }) => ({
    ...state,
    areaTypes
  })),
  on(AreaActions.fetchNationalAreaSuccess, (state, { nationalArea }) => ({
    ...state,
    area: {
      ...state.area,
      ...nationalArea
    }
  })),
  on(AreaActions.updateSelectedArea, (state, { statePath, expand })  => {
    const { currentSelection} = state,
      index = statePath ? currentSelection.indexOf(statePath) : -1,
      geoJson = new GeoJSON(),
      selectedFeatures: Feature[] = [];

    for (const slcStatePath of currentSelection) {
      const feature = getIn(state, [...slcStatePath, 'feature', 'geometry'], null);
      if (feature) {
        const olFeature = geoJson.readFeature(feature);
        olFeature.set('statePath', slcStatePath);
        selectedFeatures.push(olFeature);
      }
    }

    if (index === -1) {
      const areaFeature = statePath ?
        geoJson.readFeature(statePath ? getIn(state, [...statePath, 'feature', 'geometry']) : null) : null;
      if (areaFeature) areaFeature.set('statePath', statePath);
      return {
        ...state,
        currentSelection: statePath ? (expand ? [...currentSelection, statePath!] : [statePath]) : [],
        selectionOverlap: expand && areaFeature ? featureOverlap([...selectedFeatures, areaFeature]) : false
      };
    } else {
      const filteredSelection = expand ? currentSelection.filter((_, i) => i !== index) : [statePath!];
      return {
        ...state,
        currentSelection: filteredSelection,
        selectionOverlap: expand ? featureOverlap(selectedFeatures.filter((_, i) => i !== index)) : false
      };
    }
  }),
  on(ScenarioActions.closeActiveScenario, state => ({
    ...state,
    currentSelection: []
  })),
  on(AreaActions.fetchUserDefinedAreasSuccess, (state, { userAreas }) => ({
    ...state,
    userArea: userAreas
  })),
  on(AreaActions.createUserDefinedAreaSuccess, (state, { userArea }) => ({
    ...state,
    userArea: {
      ...state.userArea,
      [userArea.id as number]: userArea
    }
  })),
  on(AreaActions.updateUserDefinedAreaSuccess, (state, { userArea }) => ({
    ...state,
    userArea: {
      ...state.userArea,
      [userArea.id as number]: userArea
    }
  })),
  on(AreaActions.deleteUserDefinedAreaSuccess, (state, { userAreaId }) => ({
    ...state,
    userArea: Object.values(state.userArea)
      .filter(({ id }) => id !== userAreaId)
      .reduce(
        (userAreas, userArea) => ({
          ...userAreas,
          [userArea.id]: userArea
        }),
        {}
      )
  })),
  on(AreaActions.fetchCalibratedCalculationAreasSuccess, (state, { calibratedAreas }) => ({
    ...state,
    calibratedCalculationAreas: calibratedAreas
  })),
  on(AreaActions.toggleAreaGroupState, (state, { statePath, property }) => {
    return setIn(state, [...statePath, property], !getIn(state, [...statePath, property], false));
  }),
  on(AreaActions.fetchBoundariesSuccess, (state, { boundaries }) => ({
    ...state,
    boundaries
  })),
  on(AreaActions.addUserDefinedMatrix, (state, { matrix }) => ({
    ...state,
    userDefinedMatrices: updateIn(state, ['selectionMatrices', 'defaultArea', 'userDefinedMatrices'],
      oldMatrices => [...(oldMatrices as MatrixRef[]), matrix])
    })
  )
);

function featureOverlap(features: Feature[]): boolean {
  for (const f of features) {
    for (const f2 of features) {
      if (!olFeatureEquals(f, f2) && intersects(f, f2)) {
        return true;
      }
    }
  }
  return false;
}
