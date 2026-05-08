import { State } from './user.interfaces';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AreaSelectors } from '@data/area';
import { CalculationSelectors } from '@data/calculation';
import {MetadataSelectors} from "@data/metadata";

export const selectUserState = createFeatureSelector<State>('user');

export const selectIsLoggedIn = createSelector(selectUserState, (state: State) => state.isLoggedIn);

export const selectIsUserLoading = createSelector(
  selectUserState,
  (state: State): boolean => state.loading
);

export const selectLoadingBaseline = createSelector(
  selectUserState,
  (state: State): boolean => state.loadingBaseline
);

export const selectUser = createSelector(selectUserState, (state: State) => state.user);

export const selectBootstrapLoadContextActive = createSelector(
  selectUserState,
  (state: State): boolean => state.bootstrapLoadContextActive
);

export const selectErrorMessage = createSelector(selectUserState, (state: State) => state.error);

export const selectLoginError = createSelector(selectErrorMessage, (error) =>
  error ? error.login : undefined
);

export const selectBaseline = createSelector(selectUserState, (state: State) => state.baseline);

export const selectAliasing = createSelector(selectUserState, (state: State) => state.aliasing);

export const selectIsInitialLoading = createSelector(
  selectIsUserLoading, // login + fetchUser
  selectLoadingBaseline,
  AreaSelectors.selectIsBootstrapLoading,
  CalculationSelectors.selectLoadingCompoundComparisonsBootstrap,
  CalculationSelectors.selectLoadingLegendsBootstrap,
  MetadataSelectors.selectIsLoading,
  (
    userLoading: boolean,
    baselineLoading: boolean,
    areaLoading: boolean,
    compoundLoading: boolean,
    legendsLoading: boolean,
    metadataLoading: boolean
  ) =>
    userLoading ||
    baselineLoading ||
    areaLoading ||
    compoundLoading ||
    legendsLoading ||
    metadataLoading
);

export const selectIsAppBootstrapLoading = createSelector(
  selectBootstrapLoadContextActive,
  selectIsInitialLoading,
  (bootstrapLoadContextActive: boolean, isInitialLoading: boolean) =>
    bootstrapLoadContextActive && isInitialLoading
);
