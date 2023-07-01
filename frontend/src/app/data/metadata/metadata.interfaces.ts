export type StatePath = Array<string | number>;

export type ComponentKey = keyof Pick<APILayerData, 'ecoComponent' | 'pressureComponent'>;

export type BandType = 'ECOSYSTEM' | 'PRESSURE';
export type BandType_Alt = 'ecoComponents' | 'pressures';

export interface SelectableLayer {
  title: string;
  titleLocal: string;
  bandNumber: number;
  defaultSelected: boolean;
  selected?: boolean;
  visible?: boolean;
  statePath: StatePath;
}

export interface Selection {
  statePath: StatePath;
  value: boolean;
}

export interface Band extends SelectableLayer {
  marinePlaneArea: string;
  symphonyDataType: string;
  rasterFileName: string;
  metadataFileName: string;
  dateCreated: string;
  summary: string;
  summaryLocal: string;
  methodSummary: string;
  limitationsForSymphony: string;
  valueRange: string;
  dataProcessing: string;
  dataSources: string;
  recommendations: string;
  lineage: string;
  status: string;
  authorOrganisation: string;
  authorEmail: string;
  dataOwner: string;
  dataOwnerLocal: string;
  ownerEmail: string;
  topicCategory: string;
  descriptiveKeywords: string;
  theme: string;
  useLimitations: string;
  accessUserRestrictions: string;
  otherRestrictions: string;
  mapAcknowledgement: string;
  securityClassification: string;
  maintenanceInformation: string;
  spatialPresentation: string;
  rasterSpatialReferenceSystem: string;
  metadataDate: string;
  metadataOrganisation: string;
  metadataOrganisationLocal: string;
  metadataEmail: string;
  metadataLanguage: string;
  displayName: string;
  intensityMultiplier?: number; // TODO Rename
  constantIntensity?: number; // TODO rename
  layerOpacity?: number;
}

export interface BandGroup {
  symphonyTeamName: string;
  symphonyTeamNameLocal: string;
  displayName: string;
  properties: Band[];
}

export interface SymphonyTeam {
  symphonyTeams: BandGroup[];
}

export interface LayerData {
  ecoComponent: BandGroup[];
  pressureComponent: BandGroup[];
}

export interface ComponentData {
  ecoComponent: Band[];
  pressureComponent: Band[];
}

export interface APILayerData {
  ecoComponent: SymphonyTeam;
  pressureComponent: SymphonyTeam;
  language: string;
}

export interface Components {
  [key: string]: Band;
}

export interface Group {
  symphonyTeamName: string;
  symphonyTeamNameLocal: string;
  displayName: string;
  properties: Components;
}

export interface Groups {
  [key: string]: Group;
}

export interface BandChange {
  type: BandType,
  band: number,
  multiplier?: number,
  offset?: number
}

export interface State {
  ecoComponent: Groups;
  pressureComponent: Groups;
}
