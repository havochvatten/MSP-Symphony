import { createAction, props } from '@ngrx/store';
import { Band, Groups } from './metadata.interfaces';
import { ErrorMessage } from '@data/message/message.interfaces';
import { Scenario } from "@data/scenario/scenario.interfaces";

export const fetchMetadata = createAction(
  '[Metadata] Fetch Metadata'
);

export const fetchMetadataForBaseline = createAction(
  '[Metadata] Fetch Metadata by named baseline',
  props<{ baselineName: string }>()
);

export const fetchMetadataSuccess = createAction(
  '[Metadata] Fetch metadata success',
  props<{
    metadata: {
      ecoComponent: Groups;
      pressureComponent: Groups;
    };
  }>()
);

export const fetchMetadataFailure = createAction(
  '[Metadata] Fetch metadata failure',
  props<{ error: ErrorMessage }>()
);

export const selectBand = createAction(
  '[Metadata] Select band for inclusion',
  props<{ band: Band, value: boolean|undefined }>()
);

export const setVisibility  = createAction(
  '[Metadata] Set band visibility',
  props<{ band: Band, value: boolean }>()
);

export const updateLayerOpacity = createAction(
  '[Metadata] Update Layer Opacity',
  props<{ band: Band; value: number }>()
);

export const updateMultiplier = createAction(
  '[Metadata] Update intensity multiplier',
  props<{ band: Band, value: number }>()
);

export const setSelectionFromScenario = createAction(
  '[Metadata] Set selection from scenario',
  props<{ scenario: Scenario }>()
);
