import { createReducer, on } from '@ngrx/store';
import Immutable, { removeIn, setIn, updateIn } from 'immutable';

import { CalculationActions } from '@data/calculation';
import { calculationSucceeded } from "@data/calculation/calculation.actions";
import { BandChange } from "@data/metadata/metadata.interfaces";
import {
  fetchAreaMatricesFailure,
  fetchAreaMatricesSuccess,
  fetchAreaMatrixSuccess, resetAutoBatch, setAutoBatch
} from '@data/scenario/scenario.actions';
import { ScenarioActions, ScenarioInterfaces } from '@data/scenario/index';
import { ChangesProperty, ScenarioArea } from "@data/scenario/scenario.interfaces";
import { AreaMatrixData } from "@src/app/map-view/scenario/scenario-area-detail/matrix-selection/matrix.interfaces";
import { ListItemsSort } from "@data/common/sorting.interfaces";
import { size } from "@shared/common.util";


export const initialState: ScenarioInterfaces.State = {
  scenarios: [],
  active: undefined,
  activeArea: undefined,
  matrixData: null,
  matricesLoading: false,
  sortScenarios: ListItemsSort.None,
  autoBatch: []
};

export const scenarioReducer = createReducer(
  initialState,
  on(ScenarioActions.fetchScenariosSuccess, (state, { scenarios }) => {
    let newActiveIndex = undefined;
    if(state.active !== undefined) {
      newActiveIndex = scenarios.findIndex(s => s.id === state.scenarios[state.active!].id);
    }
    return {
    ...state,
    active: newActiveIndex,
    scenarios }
  }),
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
  on(ScenarioActions.setArbitraryScenarioAreaMatrixAndNormalization, (state, { areaId, matrixId, calcAreaId }) => {
    const areaIndex = state.scenarios[state.active!].areas.findIndex(a => a.id === areaId),
          updatedArea = Immutable.merge(state.scenarios[state.active!].areas[areaIndex],
              { matrix: { matrixType: 'CUSTOM', matrixId },
                         customCalcAreaId: calcAreaId } );
    return (areaIndex === -1) ? state : {
        ...state,
        scenarios: setIn(state.scenarios, [state.active, 'areas', areaIndex], updatedArea)
    }
  }),
  on(ScenarioActions.updateBandAttribute,(state, { componentType, band, attribute, value }) => {

      const change: BandChange = {
        type: componentType,
        [attribute]: value
      }, activeArea = typeof state.activeArea === 'number';

      if(state.active === undefined)
        return state;

      const path =  activeArea ?
                    [state.active, 'areas', state.activeArea, 'changes'] :
                    [state.active, 'changes'],
            store = activeArea ?
                    state.scenarios[state.active].areas[state.activeArea!].changes :
                    state.scenarios[state.active].changes;

      if(store !== null) {
        return store[componentType] !== undefined ?
          {
            ...state,
            scenarios: updateIn(state.scenarios, path.concat([componentType, band]),
              () => change)
          } : { // need to extend the changes object with component type ( Ecosystem / Pressure )
            ...state,
            scenarios: updateIn(state.scenarios, path.concat([componentType]),
              () => ({[band]: change}))
          }
      } else {
        return {
          ...state,
          scenarios: updateIn(state.scenarios, path,
            () => ({[componentType]: {[band]: change}}))
        }
      }
  }),
  on(ScenarioActions.deleteBandChange, (state, { componentType, bandNumber }) => {
    if(state.active !== undefined) {
      const path = [state.active, 'changes', componentType],
            changes = state.scenarios[state.active].changes;

      return (changes !== null && changes[componentType] !== undefined) ?
        {
          ...state,
          scenarios: size(changes[componentType]) === 1 ?
            removeIn(state.scenarios, path) :
            removeIn(state.scenarios, path.concat([bandNumber]))
        } : state;
    }
    return state;
  }),
  on(ScenarioActions.deleteAreaBandChange, (state, { componentType, bandNumber }) => {
    if(state.active !== undefined && state.activeArea !== undefined) {
      const areaChanges = state.scenarios[state.active].areas[state.activeArea].changes;

      if(areaChanges !== null && areaChanges[componentType] !== undefined) {
        const bChanges = (areaChanges[componentType] as ChangesProperty),
              path = [state.active, 'areas', state.activeArea, 'changes', componentType];
        return bChanges[bandNumber] !== undefined ? {
          ...state,
          scenarios: size(bChanges) === 1 ?
            removeIn(state.scenarios, path) :
            removeIn(state.scenarios, path.concat([bandNumber]))
        } : state;
      }
    }
    return state;
  }),
  on(ScenarioActions.resetActiveScenarioChanges, state => {
    if(state.active !== undefined) {
      return {
        ...state,
        scenarios: setIn(state.scenarios, [state.active, 'changes'], null)
      }
    }
    return state;
  }),
  on(ScenarioActions.resetActiveScenarioAreaChanges, state => {
    if(state.active !== undefined && state.activeArea !== undefined) {
      return {
        ...state,
        scenarios: setIn(state.scenarios, [state.active, 'areas', state.activeArea, 'changes'], null)
      }
    }
    return state;
  }),
  // Code duplication deemed acceptable given changes object structure
  // Alternative would be to sacrifice semantics of rxjs operators which is arguably worse
  on(ScenarioActions.updateBandAttributeForAreaIndex,
    (state, { areaIndex, componentType, band, attribute, value }) => {
      const change: BandChange = {
          type: componentType,
          [attribute]: value
      };

      if(state.active === undefined)
        return state;

      const path = areaIndex === undefined ?
                      [state.active, 'changes'] :
                      [state.active, 'areas', areaIndex, 'changes'],
            store = areaIndex === undefined ?
                      state.scenarios[state.active].changes :
                      state.scenarios[state.active].areas[areaIndex].changes;

      if(store !== null) {
          return store[componentType] !== undefined ?
              {
                  ...state,
                  scenarios: updateIn(state.scenarios, path.concat([componentType, band]),
                      () => change)
              } : { // need to extend the changes object with component type ( Ecosystem / Pressure )
                  ...state,
                  scenarios: updateIn(state.scenarios, path.concat([componentType]),
                      () => ({[band]: change}))
              }
      } else {
          return {
              ...state,
              scenarios: updateIn(state.scenarios, path,
                  () => ({[componentType]: {[band]: change}}))
          }
      }
  }),
  on(ScenarioActions.deleteBandChangeForAreaIndex, (state,{ areaIndex, componentType, band }) => {
      const activeArea = typeof state.activeArea === 'number';

      if(state.active === undefined)
        return state;

      const path = activeArea ?
                      [state.active, 'areas', areaIndex, 'changes'] :
                      [state.active, 'changes'],
            store = activeArea ?
                      state.scenarios[state.active].areas[areaIndex!].changes :
                      state.scenarios[state.active].changes;

      if(store !== null) {
          return store[componentType] !== undefined ?
              {
                  ...state,
                  scenarios: size(store[componentType]) === 1 ?
                      removeIn(state.scenarios, path.concat([componentType])) :
                      removeIn(state.scenarios, path.concat([componentType, band]))
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
  on(ScenarioActions.splitAndReplaceScenarioAreaSuccess, (state, { updatedScenario }) => ({
    ...state,
    scenarios: setIn(state.scenarios, [state.active], updatedScenario),
    matricesLoading: false
  })),
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
  })),
  on(setAutoBatch, (state, { ids }) => ({
    ...state,
    autoBatch: ids
  })),
  on(resetAutoBatch, state => ({
    ...state,
    autoBatch: []
  }))
);
