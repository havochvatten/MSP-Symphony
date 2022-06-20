import { createReducer, on } from '@ngrx/store';
import { MessageActions, MessageInterfaces } from './';

export const initialState: MessageInterfaces.State = {
  popup: []
};

export const messageReducer = createReducer(
  initialState,
  on(MessageActions.addPopupMessage, (state, { message }) => ({
    ...state,
    popup: [...state.popup, message]
  })),
  on(MessageActions.removePopupMessage, (state, { uuid }) => ({
    ...state,
    popup: state.popup.filter(message => message.uuid !== uuid)
  }))
);
