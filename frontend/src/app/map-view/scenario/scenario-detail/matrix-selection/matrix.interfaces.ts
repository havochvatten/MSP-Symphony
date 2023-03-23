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
  defaultArea: DefaultArea,
  areaTypes: AreaTypeMatrixMapping[]
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
  nameLocal: string,
  value: number;
}

export interface MatrixRow {
  presMetaId: number;
  name: string;
  nameLocal: string;
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

export interface MatrixParameters {
  areaTypes?: AreaTypeRef[];
  userDefinedMatrixId?: number; // If set, means we should use this matrix
}

export interface MatrixParameterResponse {
  defaultMatrixId: number // not used at the moment
  areaTypes?: AreaTypeRef[];
}
