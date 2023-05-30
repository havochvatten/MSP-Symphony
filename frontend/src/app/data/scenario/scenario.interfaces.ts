import { BandChange } from "@data/metadata/metadata.interfaces";
import { GeoJSONFeature } from "ol/format/GeoJSON";
import { CalcOperation, NormalizationOptions } from "@data/calculation/calculation.service";
import {
  AreaMatrixData,
  MatrixParameters
} from "@src/app/map-view/scenario/scenario-area-detail/matrix-selection/matrix.interfaces";
import { OperationParams } from "@data/calculation/calculation.interfaces";

export interface State {
  scenarios: Scenario[];
  active?: number; // index into scenarios array
  activeArea?: number; // index of area that is being edited in the active scenario
  matrixData: ScenarioMatrixDataMap | null;
  matricesLoading: boolean;
}

export interface Scenario {
  id: number;
  timestamp: number;
  baselineId: number;
  name: string;
  changes: ChangesProperty;
  normalization: NormalizationOptions;
  ecosystemsToInclude: number[];
  pressuresToInclude: number[];
  operation: CalcOperation;
  operationOptions: OperationParams;
  latestCalculationId: number | null;
  areas: ScenarioArea[];
}

export interface ScenarioArea {
  id: number;
  feature: GeoJSONFeature;
  changes: ChangesProperty | null;
  matrix: MatrixParameters;
  scenarioId: number
  excludedCoastal: number | null;
}

export interface ScenarioDisplayMeta {
  scenarioName: string | undefined;
  activeAreaName: string | undefined;
}

export interface ChangesProperty {
  [key: string]: BandChange;
}

export interface ScenarioMatrixDataMap {
  [key: number]: AreaMatrixData;
}

export interface ScenarioAreaCoastalExclusion {
  areaId: number | null;
}
