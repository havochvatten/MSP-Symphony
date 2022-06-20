import { createSelector, createFeatureSelector } from '@ngrx/store';
import { State as AppState } from '@src/app/app-reducer';
import {
  State,
} from './message.interfaces';

export const selectMessageState = createFeatureSelector<AppState, State>('message');

export const selectPopups = createSelector(
  selectMessageState,
  (state) => state.popup
);
