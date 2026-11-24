import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ConfigState } from './systemproperties.interfaces';

export const selectConfigState = createFeatureSelector<ConfigState>('config');

export const selectConfig = createSelector(
  selectConfigState,
  (state: ConfigState) => state.appConfig
);

export const selectPublicAccess = createSelector(
  selectConfigState,
  (state: ConfigState) => state.appConfig.publicAccess
);
