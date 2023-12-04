import { BandChange } from "@data/metadata/metadata.interfaces";
import { GeoJSONFeature } from "ol/format/GeoJSON";
import { CalcOperation, NormalizationOptions } from "@data/calculation/calculation.service";
import {
  AreaMatrixData,
  MatrixParameters
} from "@src/app/map-view/scenario/scenario-area-detail/matrix-selection/matrix.interfaces";
import { OperationParams } from "@data/calculation/calculation.interfaces";
import { ListItemsSort, SortableListItem } from "@data/common/sorting.interfaces";

export interface State {
  scenarios: Scenario[];
  active?: number; // index into scenarios array
  activeArea?: number; // index of area that is being edited in the active scenario
  matrixData: ScenarioMatrixDataMap | null;
  matricesLoading: boolean;
  sortScenarios: ListItemsSort;
  autoBatch: number[];
}

export interface Scenario extends SortableListItem {
  id: number;
  baselineId: number;
  changes: { [key: string] : ChangesProperty };
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
  changes: { [key: string] : ChangesProperty } | null;
  matrix: MatrixParameters;
  scenarioId: number
  excludedCoastal: number | null;
  customCalcAreaId: number | null;
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

export interface ScenarioChangeMap {
  [ bandType: string ]: { [ bandId: number ]: BandChange }
}

export interface ScenarioCopyOptions {
  name: string;
  includeScenarioChanges: boolean;
  areaChangesToInclude : number[];
}

export interface ScenarioChangesSelection {
  scenarioId: number | null;
  areaId: number | null;
  overwrite: boolean;
}

export interface ScenarioSplitOptions {
  batchName: string;
  applyScenarioChanges: boolean;
  applyAreaChanges: boolean;
  batchSelect: boolean;
}

export interface ScenarioSplitResponse {
  scenarioId: number;
  splitScenarioIds: number[];
}
