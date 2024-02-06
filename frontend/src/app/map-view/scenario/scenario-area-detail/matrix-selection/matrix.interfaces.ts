import { GeoJSONGeometry } from "ol/format/GeoJSON";

export interface MatrixRef {
  id: number;
  name: string;
  readonly immutable: boolean;
}

// se.havochvatten.symphony.metadata.dto.AreaSelectionResponseDto.Area
export interface Area {
  id: number;
  name: string;
  defaultMatrix: MatrixRef;
  matrices: MatrixRef[];
}

export interface DefaultArea extends Area {
  userDefinedMatrices: MatrixRef[];
  commonBaselineMatrices: MatrixRef[];
}

export interface AreaTypeMatrixMapping {
  id: number;
  name: string;
  coastalArea: boolean;
  areas: Area[]
}

export interface AreaMatrixData {
  defaultArea: DefaultArea | null,
  areaTypes: AreaTypeMatrixMapping[];
  overlap: AreaOverlapFragment[];
  alternativeMatrices: MatrixRef[] | null
}

export interface AreaOverlapFragment {
  polygon: GeoJSONGeometry,
  defaultMatrix: MatrixRef,
}

// se.havochvatten.symphony.dto.AreaMatrixMapping
export interface AreaMatrixMapping {
  areaId: number;
  matrixId: number;
}

export interface MatrixColumn {
  sensId: number;
  ecoMetaId: number;
  name: string;
  value: number;
}

export interface MatrixRow {
  presMetaId: number;
  name: string;
  columns: MatrixColumn[];
}

export interface MatrixData {
  rows: MatrixRow[];
}

export interface SensitivityMatrix {
  id?: number;
  name: string;
  sensMatrix: MatrixData;
}
export interface AreaTypeRef {
  id: number;
  areaMatrices: AreaMatrixMapping[];
}

export type MatrixOption = 'STANDARD' | 'CUSTOM' | 'OPTIONAL';

export interface MatrixParameters {
  matrixType: MatrixOption;
  areaTypes?: AreaTypeRef[];
  matrixId?: number;
}

