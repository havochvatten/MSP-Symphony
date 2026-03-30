import { createSelector, createFeatureSelector } from '@ngrx/store';
import { State as AppState } from '@src/app/app-reducer';
import {
  State,
  FeatureCollection,
  UserArea,
  SelectableArea,
  Feature,
  NationalArea,
  AreaGroup,
  StatePath,
  Boundary,
  UserAreaCategoryState
} from './area.interfaces';
import { getIn } from 'immutable';
import { area } from 'd3';

export const selectAreaState = createFeatureSelector<AppState, State>('area');

export const selectSelectedArea = createSelector(
  selectAreaState,
  (area: State) => area.currentSelection
);

export const selectSelectedAreaData = createSelector(
  selectAreaState,
  selectSelectedArea,
  (area: State, selectedAreas) =>
      (selectedAreas ? selectedAreas.map(s_area => getIn(area, s_area, [])) : [])
);

export const selectNationalAreas = createSelector(selectAreaState, (state: State) => {
  const { area } = state;
  const areaTypes = state.areaTypes.filter(areaType => Object.keys(area).includes(areaType));
  return areaTypes
    .map(areaType => area[areaType])
    .map(nationalArea => ({
      ...nationalArea,
      groups: Object.values(nationalArea.groups).map(group => ({
        ...group,
        areas: Object.values(group.areas)
      }))
    }));
});

//måste konvertera objekt->array
/*export const selectUserAreas = createSelector(selectAreaState, (state: State) => {
  return Object.values(state.userArea.categories).map(category => ({
    ...category,
    areas: Object.values(category.areas)
  }));
});*/
//för att felsöka via konsolen
export const selectUserAreas = createSelector(selectAreaState, (state: State) => {
  const result = Object.values(state.userArea.categories).map(category => ({
    ...category,
    areas: Object.values(category.areas)
  }));
  console.log('selectUserAreas result:', JSON.stringify(result, null, 2));
  return result;
});


export const selectAreaFeatures = createSelector(
  selectNationalAreas,
  selectUserAreas,
  (nationalAreas: NationalArea[], userAreas: UserAreaCategoryState[]): FeatureCollection[] =>
    [...getNationalAreaFeatures(nationalAreas), ...getUserAreasFeatures(userAreas)]
  );

export const selectVisibleAreas = createSelector(
  selectNationalAreas,
  selectUserAreas,
  selectSelectedArea,
  (nationalAreas: NationalArea[], userAreas: UserAreaCategoryState[], currentSelection: StatePath[]) => {
    const visibleGroups = nationalAreas.reduce(
      (groups: AreaGroup[], nationalArea) => [
        ...groups,
        ...nationalArea.groups
      ],
      []
    ).filter(group => group.visible);
    const areas = visibleGroups.reduce(
      (group_areas: SelectableArea[], group) => [...group_areas, ...group.areas],
      []
    );

    return {
      visible: [...areas, ...userAreas.filter(area => area.visible)]
        .map(area => area.statePath),
      selected: currentSelection
    }
  }
);

export const selectOverlap = createSelector(selectAreaState, state => state.selectionOverlap);

export const selectBoundaries = createSelector(selectAreaState, state => state.boundaries);

export const selectBoundaryFeatures = createSelector(
  selectBoundaries,
  (boundaries: Boundary[]) => createBoundaryFeature(boundaries)
);
export const selectCalibratedCalculationAreas = createSelector(
  selectAreaState,
  state => state.calibratedCalculationAreas
);

export const selectAll = createSelector(
  selectNationalAreas,
  selectUserAreas,
  (nationalAreas: NationalArea[], userArea: UserAreaCategoryState[]) => ({
    nationalAreas,
    userArea
  })
);

export const selectSelectedFeatureCollections = createSelector(
  selectNationalAreas,
  selectUserAreas,
  selectBoundaries,
  selectSelectedArea,
  (
    nationalAreas: NationalArea[],
    userAreas: UserAreaCategoryState[],
    boundaries: Boundary[],
    selected?: StatePath[]
  ): {
    collections: FeatureCollection[];
    boundary: FeatureCollection;
    selected?: StatePath[];
  } => {
    const nationalFeatures = getNationalAreaFeatures(nationalAreas);
    const userFeatures = getUserAreasFeatures(userAreas);
    return {
      collections: [...nationalFeatures, ...userFeatures],
      boundary: createBoundaryFeature(boundaries),
      selected
    };
  }
);

function getNationalAreaFeatures(nationalAreas: NationalArea[]): FeatureCollection[] {
  const areaGroups = nationalAreas.reduce(
    (groups: AreaGroup[], nationalArea) => [
      ...groups,
      ...nationalArea.groups
    ],
    []
  );
  const features = areaGroups.reduce(
    (areas: Feature[], group) => [...areas, ...group.areas.map(area => area.feature)],
    []
  );
  return features.length > 0 ? createFeatureCollection(features) : [];
}

function getFeatures(areas: SelectableArea[]) {
  return areas.map(area => area.feature);
}

function getUserAreasFeatures(userAreas: UserAreaCategoryState[]) {
  const allAreas = userAreas.flatMap(category => Object.values(category.areas));
  const features = getFeatures(allAreas);
  return features.length > 0 ? createFeatureCollection(features) : [];
}

function createFeatureCollection(features: Feature[]): FeatureCollection[] {
  if (features.length === 0) {
    return [];
  }
  return [
    {
      type: 'FeatureCollection',
      crs: {
        type: 'name',
        properties: {
          name: 'urn:ogc:def:crs:OGC:1.3:CRS84'
        }
      },
      features
    }
  ];
}

function createBoundaryFeature(boundaries: Boundary[]): FeatureCollection {
  return {
    type: 'FeatureCollection',
    crs: {
      type: 'name',
      properties: {
        name: 'urn:ogc:def:crs:OGC:1.3:CRS84'
      }
    },
    features: boundaries.map(({ name, polygon: geometry }) => ({
      type: 'Feature',
      properties: {
        name,
        id: 'boundaryFeature' + name,
        displayName: name,
        statePath: []
      },
      geometry
    }))
  };
}

