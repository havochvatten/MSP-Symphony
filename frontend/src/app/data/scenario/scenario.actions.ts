import { createAction, props } from "@ngrx/store";
import {
  Scenario,
  ScenarioArea,
  ScenarioAreaCoastalExclusion, ScenarioCopyOptions,
  ScenarioMatrixDataMap
} from "@data/scenario/scenario.interfaces";
import { ErrorMessage } from "@data/message/message.interfaces";
import { BandType } from "@data/metadata/metadata.interfaces";
import {
  AreaMatrixData,
  MatrixParameters
} from "@src/app/map-view/scenario/scenario-area-detail/matrix-selection/matrix.interfaces";
import { Feature } from "geojson";
import { OperationParams } from "@data/calculation/calculation.interfaces";
import { CalcOperation, NormalizationOptions } from "@data/calculation/calculation.service";
import { CopyScenarioComponent } from "@src/app/map-view/scenario/copy-scenario/copy-scenario.component";


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
  props<{ index: number }>()
);

export const openScenarioArea = createAction(
  '[Scenario] Open scenario area',
  props<{ index: number, scenarioIndex: number | null }>()
);

export const closeActiveScenario = createAction(
  '[Scenario] Close active scenario'
);

export const closeActiveScenarioArea = createAction(
  '[Scenario] Close active scenario area'
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

export const deleteScenarioArea = createAction(
  '[Scenario] Remove scenario area by id',
  props<{ areaId: number }>()
);

export const deleteScenarioAreaFailure = createAction(
  '[Scenario] Remove scenario area failure',
  props<{ error: ErrorMessage }>()
);

export const saveScenarioArea = createAction(
  '[Scenario] Save scenario area',
  props<{ areaToBeSaved: ScenarioArea }>()
);

export const addScenario = createAction(
  '[Scenario] Add scenario',
  props<{ scenario: Scenario }>()
);

export const copyScenario = createAction(
  '[Scenario] Copy scenario',
  props<{ scenarioId: number, options: ScenarioCopyOptions }>()
);

export const copyScenarioSuccess = createAction(
  '[Scenario] Copy scenario success',
  props<{ copiedScenario: Scenario }>()
);

export const copyScenarioFailure = createAction(
  '[Scenario] Copy scenario failure',
  props<{ error: ErrorMessage }>()
);

export const changeScenarioName = createAction(
  '[Scenario] Change active scenario name',
  props<{ name: string }>()
);

export const changeScenarioOperation = createAction(
  '[Scenario] Change active scenario operation',
  props<{ operation: CalcOperation }>()
);

export const changeScenarioOperationParams = createAction(
  '[Scenario] Change active scenario operation parameters',
  props<{ operationParams: OperationParams }>()
);

export const changeScenarioNormalization = createAction(
  '[Scenario] Change normalization options for active scenario',
  props<{ normalizationOptions: NormalizationOptions }>()
);

export const changeScenarioAreaMatrix = createAction(
  '[Scenario] Change matrix in active scenario area',
   //props< { areaTypes: AreaTypeRef, userDefinedMatrix: number } >()
  props< MatrixParameters >()
);

export const excludeActiveAreaCoastal = createAction(
  '[Scenario] Optionally exclude coastal area from analysis',
  props< ScenarioAreaCoastalExclusion >()
);

export const updateBandAttribute = createAction(
  '[Scenario] Update intensity attribute for band in scenario area',
  props<{ componentType: BandType, bandId: string, band: number, attribute: string, value: number }>()
);

export const toggleChangeAreaVisibility = createAction(
  '[Scenario] Request to toggle visibility of change area',
  props<{ feature: Feature, featureIndex: number }>()
);

export const setChangeAreaVisibility = createAction(
  '[Scenario] Set visibility of change area',
  props<{ featureIndex: number, visible: boolean }>()
);

export const addAreasToActiveScenario = createAction(
  '[Scenario] Add scenario areas',
  props<{ areas: ScenarioArea[] }>()
);

export const addScenarioAreasSuccess = createAction(
  '[Scenario] Add scenario areas success',
  props<{ newAreas: ScenarioArea[] }>()
);

export const deleteBandChange = createAction(
  '[Scenario] Delete band change in scenario',
  props<{ bandId: string }>()
);

export const deleteAreaBandChange = createAction(
  '[Scenario] Delete band change in scenario area',
  props<{ bandId: string }>()
);

export const fetchAreaMatrices = createAction(
  '[Scenario] Fetch matrices',
  props<{ scenarioId: number }>()
);

export const fetchAreaMatricesSuccess = createAction(
  '[Scenario] Fetch matrices success',
  props<{ matrixDataMap: ScenarioMatrixDataMap }>()
);

export const fetchAreaMatrixSuccess = createAction(
  '[Scenario] Fetch single matrix success',
  props<{ areaId: number, matrixData: AreaMatrixData }>()
);

export const fetchAreaMatricesFailure = createAction(
  '[Scenario] Fetch matrices failure',
  props<{ error: ErrorMessage }>()
);
