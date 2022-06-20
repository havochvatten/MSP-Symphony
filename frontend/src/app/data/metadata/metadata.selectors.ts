import { createFeatureSelector, createSelector } from '@ngrx/store';
import { State as AppState } from '@src/app/app-reducer';
import { Band, BandGroup, BandType, Groups, State } from './metadata.interfaces';
import { StatePath } from "@data/area/area.interfaces";

export const selectMetadataState = createFeatureSelector<AppState, State>('metadata');

export const getComponentType = (bandPath: StatePath): BandType =>
  bandPath[0] == 'ecoComponent' ? 'ECOSYSTEM' : 'PRESSURE';

export const selectEcoComponents = createSelector(
  selectMetadataState,
  (state: State) => state.ecoComponent
);

export const selectPressureComponents = createSelector(
  selectMetadataState,
  (state: State) => state.pressureComponent
);

export const selectGroups = (groups: Groups): BandGroup[] =>
  Object.values(groups).map(group => ({
    ...group,
    properties: Object.values(group.properties)
  }));

export const selectedGroups = (groups: Groups): BandGroup[] =>
  Object.values(groups)
    .map(group => ({
      ...group,
      properties: Object.values(group.properties).filter(property => property.selected)
    }))
    .filter(group => group.properties.length > 0);

export const selectMetadata = createSelector(
  selectEcoComponents,
  selectPressureComponents,
  (ecoComponent: Groups, pressureComponent: Groups) => {
    if (isEmpty(ecoComponent) || isEmpty(pressureComponent)) {
      return {
        ecoComponent: [],
        pressureComponent: []
      };
    } else {
      return {
        ecoComponent: includeAreaSpecificProperties(selectGroups(ecoComponent)),
        pressureComponent: includeAreaSpecificProperties(selectGroups(pressureComponent))
      };
    }
  }
);

export const selectSelectedComponents = createSelector(
  selectEcoComponents,
  selectPressureComponents,
  (ecoComponents, pressureComponents) => ({
    ecoComponent: filterSelectedBand(flattenBands(selectGroups(ecoComponents))),
    pressureComponent: filterSelectedBand(flattenBands(selectGroups(pressureComponents)))
  })
);

export const selectVisibleBands = createSelector(
  selectEcoComponents,
  selectPressureComponents,
  (ecoComponents, pressureComponents) => ({
    ecoComponent: filterVisibleBand(flattenBands(selectGroups(ecoComponents))),
    pressureComponent: filterVisibleBand(flattenBands(selectGroups(pressureComponents)))
  })
);

export const selectBandNumbers = createSelector(
  selectMetadata,
  ({ ecoComponent, pressureComponent }) => ({
    ecoComponent: flattenBands(ecoComponent).map(band => band.bandNumber),
    pressureComponent: flattenBands(pressureComponent).map(band => band.bandNumber)
  })
);

function includeAreaSpecificProperties(groups: BandGroup[]): BandGroup[] {
  return groups.map(group => ({
    ...group,
    properties: group.properties.map(component => ({
      ...component,
      selected: component.selected,
      intensityMultiplier: component.intensityMultiplier ?? 1,
      constantIntensity: component.constantIntensity ?? 0
    }))
  }));
}

function flattenBands(groups: BandGroup[]): Band[] {
  return groups.reduce((bands: Band[], group) => [...bands, ...group.properties], []);
}

function filterSelectedBand(bands: Band[]) {
  return bands.filter(band => band.selected);
}

function filterVisibleBand(bands: Band[]) {
  return bands.filter(band => band.visible);
}

function isEmpty(object: Record<string, any>): boolean {
  return Object.values(object).length === 0;
}

export function convertMultiplierToPercent(mul: number) {
  const fraction = mul-1;
  return fraction;
}
