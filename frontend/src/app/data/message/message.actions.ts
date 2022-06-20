import { createAction, props } from '@ngrx/store';
import { Message } from './message.interfaces';

export const addPopupMessage = createAction(
  '[Message] Add popup message',
  props<{ message: Message }>()
);

export const removePopupMessage = createAction(
  '[Message] Remove popup message',
  props<{ uuid: string }>()
);

export const noMessage = createAction('[Message] No message to add')
