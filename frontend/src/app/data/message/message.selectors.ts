import { createSelector, createFeatureSelector } from '@ngrx/store';
import {
  State,
} from './message.interfaces';

export const selectMessageState = createFeatureSelector<State>('message');

export const selectPopups = createSelector(
  selectMessageState,
  (state) => state.popup
);
