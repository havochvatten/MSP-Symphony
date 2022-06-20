import { createAction, props } from "@ngrx/store";
import { Scenario } from "@data/scenario/scenario.interfaces";
import { ErrorMessage } from "@data/message/message.interfaces";
import { BandType } from "@data/metadata/metadata.interfaces";
import { SelectableArea } from "@data/area/area.interfaces";
import { AreaMatrixData } from "@src/app/map-view/scenario/scenario-detail/matrix-selection/matrix.interfaces";
import { GeoJSONGeometry } from "ol/format/GeoJSON";
import { Feature } from "geojson";

export const fetchScenarios = createAction(
  '[Scenario] Fetch user scenarios',
);

export const fetchScenariosSuccess = createAction(
  '[Scenario] Fetch user scenarios success',
  props<{ scenarios: Scenario[] }>()
)

export const fetchScenariosFailure = createAction(
  '[Scenario] Fetch user scenarios failure',
  props<{ error: ErrorMessage }>()
)

export const openScenario = createAction(
  '[Scenario] Open scenario',
  props<{ scenario: Scenario, index: number }>()
);

export const closeActiveScenario = createAction(
  '[Scenario] Close active scenario'
);

export const deleteScenario = createAction(
  '[Scenario] Delete active scenario',
  props<{ scenarioToBeDeleted: Scenario }>()
)

export const deleteScenarioSuccess = createAction(
  '[Scenario] Delete scenario success'
);

export const deleteScenarioFailure = createAction(
  '[Scenario] Delete scenario failure',
  props<{ error: ErrorMessage }>()
);

export const saveActiveScenario = createAction(
  '[Scenario] Save active scenario',
  props<{ scenarioToBeSaved: Scenario }>()
);

export const saveScenarioSuccess = createAction(
  '[Scenario] Save scenario success',
  props<{ savedScenario: Scenario }>()
);

export const saveScenarioFailure = createAction(
  '[Scenario] Save scenario failure',
  props<{ error: ErrorMessage }>()
);

export const addScenario = createAction(
  '[Scenario] Add scenario',
  props<{ scenario: Scenario }>()
);

export const changeScenarioName = createAction(
  '[Scenario] Change active scenario name',
  props<{ name: string }>()
);

export const changeScenarioAttribute = createAction(
  '[Scenario] Change attribute in active scenario',
  props<{ attribute: string, value: any }>()
);

export const updateBandAttribute = createAction(
  '[Scenario] Update intensity attribute for band in scenario area',
  props<{ area: SelectableArea, componentType: BandType, bandId: string, band: number, attribute: string, value: number }>()
);

export const toggleChangeAreaVisibility = createAction(
  '[Scenario] Request to toggle visibility of change area',
  props<{ feature: Feature, featureIndex: number }>()
);

export const setChangeAreaVisibility = createAction(
  '[Scenario] Set visibility of change area',
  props<{ featureIndex: number, visible: boolean }>()
);

export const hideAllChangeAreas = createAction(
  '[Scenario] Hide fill of all scenario change areas'
);

export const deleteBandChangeOrChangeFeature = createAction(
  '[Scenario] Delete band change in scenario area, or perhaps whole feature',
  props<{ featureIndex: number, bandId: string }>()
);

export const deleteBandChangeAttribute = createAction(
  '[Scenario] Delete band change in scenario area',
  props<{ featureIndex: number, bandId: string }>()
);

export const deleteChangeFeature = createAction(
  '[Scenario] Delete scenario change feature',
  props<{ featureIndex: number }>()
);

export const fetchAreaMatrices = createAction(
  '[Area] Fetch matrices',
  props<{ geometry: GeoJSONGeometry }>()
);

export const fetchAreaMatricesSuccess = createAction(
  '[Area] Fetch matrices success',
  props<{ matrixData: AreaMatrixData }>()
);

export const fetchAreaMatricesFailure = createAction(
  '[Area] Fetch matrices failure',
  props<{ error: ErrorMessage }>()
);
