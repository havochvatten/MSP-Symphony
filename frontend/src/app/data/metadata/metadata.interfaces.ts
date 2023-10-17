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
  displayName: string;
  intensityMultiplier?: number; // TODO Rename
  constantIntensity?: number; // TODO rename
  layerOpacity?: number;
  meta:
    { [key: string]: string; };
}

export interface BandGroup {
  symphonyThemeName: string;
  symphonyThemeNameLocal: string;
  displayName: string;
  properties: Band[];
}

export interface SymphonyTheme {
  symphonyThemes: BandGroup[];
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
  ecoComponent: SymphonyTheme;
  pressureComponent: SymphonyTheme;
  language: string;
}

export interface Components {
  [key: string]: Band;
}

export interface Group {
  symphonyThemeName: string;
  symphonyThemeNameLocal: string;
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
