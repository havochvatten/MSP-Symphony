import { MultiPolygon } from "ol/geom";

export type ComponentKey = keyof Pick<APILayerData, 'ecoComponent' | 'pressureComponent'>;

export type BandType = 'ECOSYSTEM' | 'PRESSURE';
export type BandType_Alt = 'ecoComponents' | 'pressures';

export const BandTypes = ['ECOSYSTEM', 'PRESSURE'] as const;

export interface ReliabilityMapping {
  partitions: { value: number, polygon: MultiPolygon }[];
}

export interface SelectableLayer {
  title: string;
  bandNumber: number;
  symphonyCategory: BandType;
  selected: boolean;
  reliability: ReliabilityMapping | null;
  visible?: boolean;
  loaded?: boolean;
}

export interface Band extends SelectableLayer {
  intensityMultiplier?: number; // TODO Rename
  constantIntensity?: number; // TODO rename
  layerOpacity?: number;
  meta:
    { [key: string]: string };
}

export interface BandGroup {
  symphonyThemeName: string;
  bands: Band[];
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
  bands: Components;
}

export interface Groups {
  [key: string]: Group;
}

export interface BandChange {
  type: BandType;
  multiplier?: number;
  offset?: number;
}

export interface ReliabilityMap {
  ECOSYSTEM:  {[key: number]:  ReliabilityMapping };
  PRESSURE:   {[key: number]:  ReliabilityMapping };
}

export interface VisibleReliability {
  band: Band;
  opaque: boolean;
}

export interface State {
  ECOSYSTEM: Groups;
  PRESSURE: Groups;
  visibleReliability: VisibleReliability | null;
}

export function bandEquals(a: Band, b: Band): boolean {
  return a.bandNumber === b.bandNumber
    && a.symphonyCategory === b.symphonyCategory;
}

// TODO: Consolidate these everywhere
export const bandTypesMap: Map<BandType | BandType_Alt, BandType | BandType_Alt>  = new Map([
  ['ECOSYSTEM', 'ecoComponents'],
  ['PRESSURE', 'pressures'],
  ['ecoComponents', 'ECOSYSTEM'],
  ['pressures', 'PRESSURE']
]);
