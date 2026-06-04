import { createAction, props } from '@ngrx/store';
import { AppConfig } from './systemproperties.interfaces';

export const loadConfig = createAction('[Config] Load Config');
export const loadConfigSuccess = createAction(
  '[Config] Load Config Success',
  props<{ config: AppConfig }>()
);
export const loadConfigFailure = createAction(
  '[Config] Load Config Failure',
  props<{ error: string }>()
);
