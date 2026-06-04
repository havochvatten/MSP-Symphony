import { createReducer, on } from '@ngrx/store';
import { SystemPropertiesActions as ConfigActions } from './index';
import { ConfigState } from './systemproperties.interfaces';

export const initialState: ConfigState = {
  appConfig: { publicAccess: false },
  loaded: false,
  error: null
};

export const configReducer = createReducer(
  initialState,
  on(ConfigActions.loadConfig, (state) => ({
    ...state,
    loaded: false,
    error: null
  })),
  on(ConfigActions.loadConfigSuccess, (state, { config }) => {
    return {
      ...state,
      appConfig: config,
      loaded: true
    };
  }),
  on(ConfigActions.loadConfigFailure, (state, { error }) => ({
    ...state,
    error,
    loaded: true
  }))
);
