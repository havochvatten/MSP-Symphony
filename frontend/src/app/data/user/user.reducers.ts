import { UserActions, UserInterfaces } from './';
import { createReducer, on } from '@ngrx/store';

export const initialState: UserInterfaces.State = {
  isLoggedIn: false,
  loading: false,
  loadingBaseline: false,
  bootstrapLoadContextActive: false,
  redirectUrl: '/map',
  aliasing: true
};

export const userReducer = createReducer(
  initialState,
  on(UserActions.loginUser, (state) => ({
    ...state,
    bootstrapLoadContextActive: true,
    loading: true
  })),
  on(UserActions.fetchUserForBootstrapSuccess, UserActions.loginUserSuccess, UserActions.fetchUserSuccess, (state, { user }) => ({
    ...state,
    user,
    aliasing: user.settings?.aliasing === undefined ? state.aliasing : user.settings.aliasing,
    loading: false,
    isLoggedIn: true,
    error: undefined
  })),
  on(UserActions.loginUserFailure, (state, { error }) => ({
    ...state,
    bootstrapLoadContextActive: false,
    loading: false,
    isLoggedIn: false,
    error: {
      ...state.error,
      login: error
    }
  })),
  on(UserActions.fetchUserForBootstrap, (state) => ({
    ...state,
    bootstrapLoadContextActive: true,
    loading: true
  })),
  on(UserActions.fetchUserForRefresh, (state) => ({
    ...state,
    loading: true
  })),
  on(UserActions.fetchUserSettingsSuccess, (state, { user }) => ({
    ...state,
    user,
    aliasing: user.settings?.aliasing === undefined ? state.aliasing : user.settings.aliasing
  })),
  on(UserActions.fetchUserFailure, (state, { error }) => ({
    ...state,
    bootstrapLoadContextActive: false,
    loading: false,
    isLoggedIn: false,
    error: {
      ...state.error,
      fetch: error
    }
  })),
  on(UserActions.completeBootstrapLoad, (state) => ({
    ...state,
    bootstrapLoadContextActive: false
  })),
  on(UserActions.logoutUserSuccess, (state) => ({
    ...state,
    bootstrapLoadContextActive: false
  })),
  on(UserActions.fetchBaselineSuccess, (state, { baseline }) => ({
    ...state,
    baseline: baseline
  })),
  on(UserActions.updateRedirectUrl, (state, { url }) => ({
    ...state,
    redirectUrl: url
  })),
  // Indicate loading state
  on(UserActions.fetchBaseline, (state) => ({
    ...state,
    loadingBaseline: true
  })),
  // Reset loading state on success/failure
  on(UserActions.fetchBaselineSuccess, UserActions.fetchBaselineFailure, (state) => ({
    ...state,
    loadingBaseline: false
  }))
);
