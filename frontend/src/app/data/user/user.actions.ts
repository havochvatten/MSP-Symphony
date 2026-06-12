import { createAction, props } from '@ngrx/store';
import { Baseline, User, UserSettings } from './user.interfaces';
import { ErrorMessage } from '@data/message/message.interfaces';

export const fetchUser = createAction('[User] Fetch user');

export const fetchUserSettings = createAction('[User] Fetch user settings');

export const fetchUserSuccess = createAction(
  '[User] Fetch metadata success',
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

export const fetchAvailableBaselines = createAction('[User] Fetch available baselines');

export const fetchAvailableBaselinesSuccess = createAction(
  '[User] Fetch available baselines success',
  props<{ baselines: Baseline[] }>()
);

export const fetchAvailableBaselinesFailure = createAction(
  '[User] Fetch available baselines failure',
  props<{ error: ErrorMessage }>()
);

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
  props<Partial<UserSettings>>()
);

export const activeBaselineChanged = createAction(
  '[User] Active baseline changed',
  props<{ baseline: Baseline }>()
);

export const navigateTo = createAction('[User] Navigate to', props<{ url: string }>());
