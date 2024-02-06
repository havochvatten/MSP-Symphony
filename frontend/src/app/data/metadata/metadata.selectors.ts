import { createFeatureSelector, createSelector } from '@ngrx/store';
import { State as AppState } from '@src/app/app-reducer';
import { Band, BandGroup, BandType, Groups, State } from './metadata.interfaces';

export const selectMetadataState = createFeatureSelector<AppState, State>('metadata');

export const getBandPath = (band: Band) =>
  [band.symphonyCategory, band.meta.symphonytheme, 'bands', band.bandNumber];

export const getBandByTypeAndNumber = (state: State, bandType: BandType, bandNumber: number): Band | undefined => {
  return flattenBands(selectGroups(state[bandType]))
    .find(band => band.bandNumber === bandNumber);
}

export const selectEcoComponents = createSelector(
  selectMetadataState,
  (state: State) => state.ECOSYSTEM
);

export const selectPressureComponents = createSelector(
  selectMetadataState,
  (state: State) => state.PRESSURE
);

export const selectGroups = (groups: Groups): BandGroup[] =>
  Object.values(groups).map(group => ({
    ...group,
    bands: Object.values(group.bands)
  }));

export const selectedGroups = (groups: Groups): BandGroup[] =>
  Object.values(groups)
    .map(group => ({
      ...group,
      bands: Object.values(group.bands).filter(band => band.selected)
    }))
    .filter(group => group.bands.length > 0);

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

const metaDictReducer = (m:{[key: string]: string}, v: Band ) => { m[v.bandNumber] = v.title; return m; };

export const selectMetaDisplayDictionary = createSelector(
  selectMetadata,
  ({ ecoComponent, pressureComponent }) => {
    return {
      "ECOSYSTEM" : flattenBands(ecoComponent).reduce(metaDictReducer, {}),
      "PRESSURE"  : flattenBands(pressureComponent).reduce(metaDictReducer, {})
    };
  });

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
    bands: group.bands.map(component => ({
      ...component,
      selected: component.selected,
      intensityMultiplier: component.intensityMultiplier ?? 1,
      constantIntensity: component.constantIntensity ?? 0
    }))
  }));
}

function flattenBands(groups: BandGroup[]): Band[] {
  return groups.reduce((bands: Band[], group) => [...bands, ...group.bands], []);
}

function filterSelectedBand(bands: Band[]) {
  return bands.filter(band => band.selected);
}

function filterVisibleBand(bands: Band[]) {
  return bands.filter(band => band.visible);
}

function isEmpty(object: Record<string, unknown>): boolean {
  return Object.values(object).length === 0;
}

export function convertMultiplierToPercent(mul: number) {
  return mul - 1;
}
