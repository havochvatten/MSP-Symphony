import { BandChange } from "@data/metadata/metadata.interfaces";
import { GeoJSONFeature, GeoJSONFeatureCollection } from "ol/format/GeoJSON";
import { NormalizationOptions } from "@data/calculation/calculation.service";
import { MatrixParameters } from "@src/app/map-view/scenario/scenario-detail/matrix-selection/matrix.interfaces";

export interface State {
  scenarios: Scenario[];
  active?: number; // index into scenarios array
  activeFeature?: number; // index of change feature that is being edited in the active scenario
  matricesLoading: boolean;
}

export interface Scenario {
  id: string;
  timestamp: number;
  baselineId: number;
  name: string;
  feature: GeoJSONFeature; // Would like to use proper OL feature
  changes: GeoJSONFeatureCollection;
  matrix: MatrixParameters;
  normalization: NormalizationOptions;
  latestCalculation: string; // id of the latest calculation,
  ecosystemsToInclude: number[],
  pressuresToInclude: number[],
}

export interface ChangesProperty {
  [key: string]: BandChange;
}
