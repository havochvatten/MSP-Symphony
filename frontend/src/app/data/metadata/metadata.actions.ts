import { createAction, props } from '@ngrx/store';
import { Groups, Selection, StatePath } from './metadata.interfaces';
import { ErrorMessage } from '@data/message/message.interfaces';

export const fetchMetadata = createAction(
  '[Metadata] Fetch Metadata',
  props<{ baseline: string }>()
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

export const updateSelections = createAction(
  '[Metadata] Update Layer Selections',
  props<{ selections: Selection[] }>()
);

export const updateVisible = createAction(
  '[Metadata] Update Layer Visible',
  props<{ selections: Selection[] }>()
);

export const updateLayerOpacity = createAction(
  '[Metadata] Update Layer Opacity',
  props<{ bandPath: StatePath; value: number }>()
);

export const updateMultiplier = createAction(
  '[Metadata] Update intensity multiplier',
  props<{ bandPath: StatePath; value: number }>()
);
