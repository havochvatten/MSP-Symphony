import { State } from './user.interfaces';
import { State as AppState } from '@src/app/app-reducer';
import { createSelector, createFeatureSelector } from '@ngrx/store';

export const selectUserState = createFeatureSelector<AppState, State>('user');

export const selectIsLoggedIn = createSelector(
  selectUserState,
  (state: State) => state.isLoggedIn
);

export const selectIsLoading = createSelector(
  selectUserState,
  (state: State): boolean => state.loading
)

export const selectUser = createSelector(
  selectUserState,
  (state: State) => state.user
);

export const selectErrorMessage = createSelector(
  selectUserState,
  (state: State) => state.error
);

export const selectLoginError = createSelector(
  selectErrorMessage,
  error => (error ? error.login : undefined)
);

export const selectBaseline = createSelector(
  selectUserState,
  (state: State) => state.baseline
);

export const selectAliasing = createSelector(
  selectUserState,
  (state: State) => state.aliasing
)
