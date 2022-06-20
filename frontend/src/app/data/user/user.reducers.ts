import { UserActions, UserInterfaces } from './';
import { createReducer, on } from '@ngrx/store';

export const initialState: UserInterfaces.State = {
  isLoggedIn: false,
  loading: false,
  redirectUrl: '/map'
};

export const userReducer = createReducer(
  initialState,
  on(UserActions.loginUser, state => ({
    ...state,
    loading: true
  })),
  on(UserActions.loginUserSuccess, (state, { user }) => ({
    ...state,
    user,
    loading: false,
    isLoggedIn: true,
    error: undefined
  })),
  on(UserActions.loginUserFailure, (state, { error }) => ({
    ...state,
    loading: false,
    isLoggedIn: false,
    error: {
      ...state.error,
      login: error
    }
  })),
  on(UserActions.fetchUser, state => ({
    ...state,
    loading: true
  })),
  on(UserActions.fetchUserSuccess, (state, { user }) => ({
    ...state,
    user,
    loading: false,
    isLoggedIn: true,
    error: undefined
  })),
  on(UserActions.fetchUserFailure, (state, { error }) => ({
    ...state,
    loading: false,
    isLoggedIn: false,
    error: {
      ...state.error,
      fetch: error
    }
  })),
  on(UserActions.fetchBaselineSuccess, (state, { baseline }) => ({
    ...state,
    baseline: baseline
  })),
  on(UserActions.updateRedirectUrl, (state, { url }) => ({
    ...state,
    redirectUrl: url
  }))
);
