import { createReducer, on } from '@ngrx/store';
import { removeIn, setIn, updateIn } from 'immutable';
import { size } from "lodash";

import { CalculationActions } from '@data/calculation';
import { calculationSucceeded } from "@data/calculation/calculation.actions";
import { BandChange } from "@data/metadata/metadata.interfaces";
import {
  fetchAreaMatricesFailure,
  fetchAreaMatricesSuccess,
  fetchAreaMatrixSuccess
} from '@data/scenario/scenario.actions';
import { ScenarioActions, ScenarioInterfaces } from '@data/scenario/index';
import { ChangesProperty, ScenarioArea } from "@data/scenario/scenario.interfaces";
import { AreaMatrixData } from "@src/app/map-view/scenario/scenario-area-detail/matrix-selection/matrix.interfaces";
import { ListItemsSort } from "@data/common/sorting.interfaces";


export const initialState: ScenarioInterfaces.State = {
  scenarios: [],
  active: undefined,
  activeArea: undefined,
  matrixData: null,
  matricesLoading: false,
  sortScenarios: ListItemsSort.None
};

export const scenarioReducer = createReducer(
  initialState,
  on(ScenarioActions.fetchScenariosSuccess, (state, { scenarios }) => ({
    ...state,
    scenarios
  })),
  on(ScenarioActions.openScenario, (state, { index }) => ({
    ...state,
    active: index,
    matrixData: null,
    matricesLoading: true
  })),
  on(ScenarioActions.openScenarioArea, (state, { index, scenarioIndex }) => ({
    ...state,
    active: scenarioIndex ?? state.active,
    activeArea: index
  })),
  on(ScenarioActions.closeActiveScenario, state => ({
    ...state,
    active: undefined,
    activeArea: undefined,
    matrixData: null
  })),
  on(ScenarioActions.closeActiveScenarioArea, state => ({
    ...state,
    activeArea: undefined,
  })),
  on(ScenarioActions.addScenario, (state, { scenario }) => ({
    ...state,
    scenarios: [scenario, ...state.scenarios], // prepend, since it will be newest
    active: 0,
    matricesLoading: true
  })),
  on(ScenarioActions.deleteScenario, (state, _) => ({
    ...state,
    scenarios: removeIn(state.scenarios, [state.active]),
    // Optimistically close scenario to reduce latency
    active: undefined,
    activeArea: undefined
  })),
  on(ScenarioActions.setScenarioSortType, (state, { sortType }) => ({
    ...state,
    sortScenarios: sortType
  })),
  on(ScenarioActions.saveScenarioSuccess, (state, { savedScenario }) => ({
    ...state,
    scenarios: updateIn(state.scenarios, [state.active], () => savedScenario),
  })),
  on(ScenarioActions.saveScenarioArea, (state, { areaToBeSaved }) => {
    const areaIndex = state.scenarios[state.active!].areas.findIndex(area => area.id === areaToBeSaved.id);
    return (areaIndex === -1) ? state : {
    ...state,
    scenarios: updateIn(state.scenarios, [state.active, 'areas', areaIndex], () => areaToBeSaved)
  }}),
  on(ScenarioActions.addScenarioAreasSuccess, (state, { newAreas }) => ({
    ...state,
    scenarios: updateIn(state.scenarios, [state.active, 'areas'], areas => [...(areas as ScenarioArea[]), ...newAreas]),
    matricesLoading: true
  })),
  on(CalculationActions.calculationSucceeded, (state, { calculation }) => ({
    ...state,
    scenarios: setIn(state.scenarios, [state.active, 'latestCalculationId'], calculation.id)
  })),
  on(ScenarioActions.changeScenarioName, (state, { name }) => ({
    ...state,
    scenarios: setIn(state.scenarios, [state.active, 'name'], name)
  })),
  on(ScenarioActions.changeScenarioOperation, (state, { operation }) => ({
    ...state,
    scenarios: setIn(state.scenarios, [state.active, 'operation'], operation)
  })),
  on(ScenarioActions.changeScenarioOperationParams, (state, { operationParams }) => ({
    ...state,
    scenarios: setIn(state.scenarios, [state.active, 'operationOptions'], operationParams)
  })),
  on(ScenarioActions.changeScenarioNormalization, (state, { normalizationOptions }) => ({
    ...state,
    scenarios: setIn(state.scenarios, [state.active, 'normalization'], normalizationOptions)
  })),
  on(ScenarioActions.changeScenarioAreaMatrix, (state, { matrixType, matrixId, areaTypes }) => ({
    ...state,
    scenarios: setIn(state.scenarios, [state.active, 'areas', state.activeArea, 'matrix'], { matrixType, matrixId, areaTypes })
  })),
  on(ScenarioActions.excludeActiveAreaCoastal, (state, { areaId }) => ({
    ...state,
    scenarios: setIn(state.scenarios, [state.active, 'areas', state.activeArea, 'excludedCoastal'], areaId)
  })),
  on(
    ScenarioActions.updateBandAttribute,
    (state, { componentType, bandId, band, attribute, value }) => {

      const change: BandChange = {
        type: componentType,
        band: band,
        [attribute]: value
      }
      if(state.active === undefined)
        return state;

      if(state.activeArea !== undefined) {
        return state.scenarios[state.active].areas[state.activeArea].changes !== null ? {
          ...state,
          scenarios: updateIn(state.scenarios, [state.active, 'areas', state.activeArea, 'changes', bandId],
            () => change)
        } : {
          ...state,
          scenarios: updateIn(state.scenarios, [state.active, 'areas', state.activeArea, 'changes'],
            () => ({[bandId]: change}))
        }
      } else {
        return state.scenarios[state.active].changes !== null ?
          {
            ...state,
            scenarios: updateIn(state.scenarios, [state.active, 'changes', bandId],
              () => change)
          } : {
            ...state,
            scenarios: updateIn(state.scenarios, [state.active, 'changes'],
              () => ({[bandId]: change}))
          };
      }
    }
  ),
  on(ScenarioActions.deleteBandChange, (state, { bandId }) => {
    if(state.active !== undefined && state.scenarios[state.active].changes !== null) {
      const bChanges = (state.scenarios[state.active].changes as ChangesProperty);
      return bChanges[bandId] !== undefined ? {
        ...state,
        scenarios: size(bChanges) === 1 ?
          setIn(state.scenarios, [state.active, 'changes'], null) :
          removeIn(state.scenarios, [state.active, 'changes', bandId])
      } : state;
    }
    return state;
  }),
  on(ScenarioActions.deleteAreaBandChange, (state, { bandId }) => {
    if(state.active !== undefined && state.activeArea !== undefined &&
      state.scenarios[state.active].areas[state.activeArea].changes !== null) {
        const bChanges = (state.scenarios[state.active].areas[state.activeArea].changes as ChangesProperty);
        return bChanges !== undefined ? {
          ...state,
          scenarios: size(bChanges) === 1 ?
            setIn(state.scenarios, [state.active, 'areas', state.activeArea, 'changes'], null) :
            removeIn(state.scenarios, [state.active, 'areas', state.activeArea, 'changes', bandId])
        } : state;
    }
    return state;
  }),
  on(ScenarioActions.setChangeAreaVisibility, (state, { featureIndex, visible }) => ({
    ...state,
    scenarios: setIn(
      state.scenarios,
      [state.active, 'changes', 'features', featureIndex, 'properties', 'visible'],
      visible
    )
  })),
  on(ScenarioActions.deleteScenarioArea, (state, { areaId }) => {
    if(state.active === undefined) {
        return state;
    } else {
      const areaIndex = state.scenarios[state.active!].areas.findIndex(a => a.id === areaId);
      return {
        ...state,
        scenarios: removeIn(state.scenarios, [state.active, 'areas', areaIndex]),
        matrixData: removeIn(state.matrixData, [areaId]),
      }
    }
  }),
  on(ScenarioActions.copyScenarioSuccess, (state, { copiedScenario }) => ({
    ...state,
    scenarios: [copiedScenario, ...state.scenarios]
  })),
  on(fetchAreaMatricesSuccess, (state, { matrixDataMap }) => {
    const data = Object.values(matrixDataMap) as AreaMatrixData[],
          loading = data.some(d => d.overlap.length > 0);
    return {
      ...state,
      matrixData: matrixDataMap,
      matricesLoading: loading
    }
  }),
  on(ScenarioActions.transferChangesSuccess, (state, { scenario: updatedScenario }) => {
    return {
      ...state,
      scenarios: setIn(state.scenarios, [state.active], updatedScenario)
    }
  }),
  on(fetchAreaMatrixSuccess, (state, { areaId, matrixData }) => {
    const loading = matrixData.overlap.length > 0;
    return {
      ...state,
      matrixData: setIn(state.matrixData, [areaId], matrixData),
      matricesLoading: loading
    }
  }),
  on(calculationSucceeded, (state, { calculation }) => {
    return {
      ...state,
      scenarios: setIn(state.scenarios, [state.active, 'latestCalculationId'], calculation.id)
    }
  }),
  on(fetchAreaMatricesFailure, state => ({
    ...state,
    matricesLoading: false
  }))
);
