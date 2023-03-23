import { AreaMatrixData } from "@src/app/map-view/scenario/scenario-detail/matrix-selection/matrix.interfaces";

export type StatePath = Array<string | number>;

export interface Polygon { // Really a GeoJSON geometry
  type: string;
  coordinates: number[];
}
// export type Polygon = GeoJSONPolygon;

export interface SelectableArea {
  name: string;
  displayName: string;
  polygon: Polygon; // GeoJSONGeometry;
  feature: Feature;
  visible?: boolean;
  statePath: StatePath; // replace with "jsonPath" (JSONPath), with areas in JSON structure?
}

export interface Area extends SelectableArea {
  code: string;
  searchdata: string;
  areaKm2: number;
}

export interface UserArea extends SelectableArea {
  id?: number;
  description: string;
}

export interface AreaImport {
  areaNames: string[];
}

export interface AreaGroup {
  en: string;
  name: string;
  visible: boolean;
  statePath: StatePath;
  areas: Area[];
  [lang: string]: any;
}

export interface NationalArea {
  type: string;
  en: string;
  displayName: string;
  groups: AreaGroup[];
  [lang: string]: string|AreaGroup[];
}

export interface Boundary {
  name: string;
  polygon: Polygon;
}

export interface AllAreas {
  nationalAreas: NationalArea[];
  userArea: UserArea[];
}

export interface CRSProperties {
  name: string;
}

export interface CRS {
  type: string;
  properties: CRSProperties;
}

export interface FeatureProperties {
  name: string;
  id: string | number;
  displayName: string;
  statePath: StatePath;
  code?: string;
}

// export type Feature = GeoJSONFeature
export interface Feature {
  type: 'Feature';
  properties: FeatureProperties;
  geometry: Polygon;
}

// export type FeatureCollection = GeoJSONFeatureCollection
export interface FeatureCollection {
  type: 'FeatureCollection';
  crs: CRS;
  features: Feature[];
}

export interface Areas {
  [key: number]: Area;
}

export interface AreaGroupState {
  en: string;
  name: string;
  visible: boolean;
  statePath: StatePath;
  areas: {
    [key: string]: Area;
  }
}

export interface NationalAreaState {
  type: string;
  en: string;
  displayName: string;
  groups: {
    [key: string]: AreaGroupState;
  }
}

export interface UserAreasState {
  [key: number]: UserArea;
}

export interface UploadedUserDefinedArea {
  srid: number,
  featureIdentifiers: string[],
  key: string;
}

export interface State {
  areaTypes: string[];
  area: {
    [key: string]: NationalAreaState;
  }
  userArea: UserAreasState;
  boundaries: Boundary[];
  currentSelection?: StatePath; // currentFeature?
  selectionMatrices?: AreaMatrixData;
}
