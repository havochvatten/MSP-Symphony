import { createAction, props } from '@ngrx/store';
import { Baseline, User } from './user.interfaces';
import { ErrorMessage } from '@data/message/message.interfaces';

export const fetchUserForBootstrap = createAction('[User] Fetch user for bootstrap');

export const fetchUserForRefresh = createAction('[User] Fetch user for refresh');

export const fetchUserSettings = createAction('[User] Fetch user settings');

export const completeBootstrapLoad = createAction('[User] Complete bootstrap load');

export const fetchUserSuccess = createAction(
  '[User] Fetch metadata success',
  props<{ user: User }>()
);

export const fetchUserForBootstrapSuccess = createAction(
  '[User] Fetch user for bootstrap success',
  props<{ user: User }>()
);

export const fetchUserFailure = createAction(
  '[User] Fetch metadata failure',
  props<{ error: ErrorMessage }>()
);

export const fetchUserSettingsSuccess = createAction(
  '[User] Fetch user settings success',
  props<{ user: User }>()
);

export const loginUser = createAction(
  '[User] Login user',
  props<{ username: string, password: string }>()
);

export const loginUserSuccess = createAction('[User] Login user success', props<{ user: User }>());

export const loginUserFailure = createAction(
  '[User] Login user failure',
  props<{ error: ErrorMessage }>()
);

export const logoutUser = createAction('[User] Logout user');

export const logoutUserSuccess = createAction('[User] Logout user success');

export const logoutUserFailure = createAction(
  '[User] Logout user failure',
  props<{ error: ErrorMessage }>()
);

export const fetchBaseline = createAction('[User] Fetch baseline');

export const fetchBaselineSuccess = createAction(
  '[User] Fetch baseline success',
  props<{ baseline: Baseline }>()
);

export const fetchBaselineFailure = createAction(
  '[User] Fetch baseline failure',
  props<{ error: ErrorMessage }>()
);

export const updateRedirectUrl = createAction(
  '[User] Update redirect url',
  props<{ url: string }>()
);

export const updateUserSettings = createAction(
  '[User] Update user settings',
  props<{ aliasing?: boolean, locale?: string }>()
);

export const navigateTo = createAction('[User] Navigate to', props<{ url: string }>());
