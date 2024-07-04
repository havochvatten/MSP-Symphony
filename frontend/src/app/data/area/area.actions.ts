import { createAction, props } from '@ngrx/store';
import { Boundary, NationalAreaState, Polygon, StatePath,
         UserArea, UserAreasState, CalculationAreaSlice } from './area.interfaces';
import { ErrorMessage } from '@data/message/message.interfaces';
import { MatrixRef } from "@src/app/map-view/scenario/scenario-area-detail/matrix-selection/matrix.interfaces";

export const fetchNationalAreas = createAction('[Area] Fetch national areas');

export const fetchNationalAreaTypesSuccess = createAction(
  '[Area] Fetch national area types success',
  props<{ areaTypes: string[] }>()
);

export const fetchNationalAreaTypesFailure = createAction(
  '[Area] Fetch national area types failure',
  props<{ error: ErrorMessage }>()
);

export const fetchNationalArea = createAction(
  '[Area] Fetch national area',
  props<{ areaType: string }>()
);

export const fetchNationalAreaSuccess = createAction(
  '[Area] Fetch national areas data success',
  props<{
    nationalArea: {
      [key: string]: NationalAreaState;
    };
  }>()
);

export const fetchNationalAreaFailure = createAction(
  '[Area] Fetch national areas data failure',
  props<{ error: ErrorMessage }>()
);

export const fetchCalibratedCalculationAreasSuccess = createAction(
  '[Area] Fetch all calibrated calculation areas for baseline success',
  props<{ calibratedAreas: CalculationAreaSlice[] }>()
);

export const fetchCalibratedCalculationAreasFailure = createAction(
  '[Area] Fetch all calibrated calculation areas for baseline failure',
  props<{ error: ErrorMessage }>()
);

export const fetchUserDefinedAreas = createAction('[Area] Fetch all user defined areas');

export const fetchUserDefinedAreasSuccess = createAction(
  '[Area] Fetch all user defined areas success',
  props<{ userAreas: UserAreasState }>()
);

export const fetchUserDefinedAreasFailure = createAction(
  '[Area] Fetch all user defined areas failure',
  props<{ error: ErrorMessage }>()
);

export const createUserDefinedArea = createAction(
  '[Area] Create user defined area',
  props<{ name: string, description: string, polygon: Polygon }>()
);

export const createUserDefinedAreaSuccess = createAction(
  '[Area] Create user defined area success',
  props<{ userArea: UserArea }>()
);

export const createUserDefinedAreaFailure = createAction(
  '[Area] Create user defined area failure',
  props<{ error: ErrorMessage }>()
);

export const updateUserDefinedArea = createAction(
  '[Area] Update user defined area',
  props<{ id: number, name: string, description: string, polygon: Polygon }>()
);

export const updateUserDefinedAreaSuccess = createAction(
  '[Area] Update user defined area success',
  props<{ userArea: UserArea }>()
);

export const updateUserDefinedAreaFailure = createAction(
  '[Area] Update user defined area failure',
  props<{ error: ErrorMessage }>()
);

export const deleteUserDefinedArea = createAction(
  '[Area] Delete user defined area',
  props<{ userAreaId: number }>()
);

export const deleteMultipleUserDefinedAreas = createAction(
  '[Area] Delete multiple user defined areas',
  props<{ userAreaIds: number[] }>()
);

export const deleteUserDefinedAreaSuccess = createAction(
  '[Area] Delete user defined area success',
  props<{ userAreaId: number }>()
);

export const deleteUserDefinedAreaFailure = createAction(
  '[Area] Delete user defined area failure',
  props<{ error: ErrorMessage }>()
);

export const updateSelectedArea = createAction(
  '[Area] Update selected area',
  props<{ statePath?: StatePath, expand: boolean }>()
);

export const addUserDefinedMatrix = createAction(
  '[Area] Update selected area matrix data',
  props<{ matrix: MatrixRef }>()
);

export const toggleAreaGroupState = createAction(
  '[Area] Toggle state of area group',
  props<{ statePath: StatePath, property: string }>()
);

export const fetchBoundaries = createAction('[Area] Fetch boundaries');

export const fetchBoundariesSuccess = createAction(
  '[Area] Fetch boundaries success',
  props<{ boundaries: Boundary[] }>()
);

export const fetchBoundariesFailure = createAction(
  '[Area] Fetch boundaries failure',
  props<{ error: ErrorMessage }>()
);

// export const uploadUserDefinedArea = createAction(
//   '[Area] Upload user defined area',
//   props<{ formdata: FormData }>()
// );

// export const importUserDefinedArea = createAction(
//   '[Area] Upload user defined area',
//   props<{ /*some identifier? */ }>()
// );

// export const inspectUserUploadedAreaFailure = createAction(
//   '[Area] User uploaded area inspection failure',
//   props<{ error: ErrorMessage }>()
// );
