import { Action, ActionReducer, combineReducers } from '@ngrx/store';
import { clearStateOnLogout, reducers, State } from './app-reducer';
import { UserActions } from '@data/user';
import { initialState as userInitialState } from '@data/user/user.reducers';

describe('clearStateOnLogout meta-reducer', () => {
  const rootReducer = combineReducers(reducers);
  const init = (): State => rootReducer(undefined, { type: '@@init' } as Action);

  const loggedInState = (): State =>
    rootReducer(init(), UserActions.loginUserSuccess({ user: { username: 'someone' } }));

  it('resets root state to initial on logoutUserSuccess', () => {
    const before = loggedInState();
    expect(before.user.isLoggedIn).toBe(true);

    const meta = clearStateOnLogout(rootReducer);
    const after = meta(before, UserActions.logoutUserSuccess());

    expect(after.user.isLoggedIn).toBe(false);
    expect(after.user).toEqual(userInitialState);
  });

  it('passes other actions through without resetting', () => {
    const before = loggedInState();

    const meta = clearStateOnLogout(rootReducer);
    const after = meta(before, { type: '[Other] noop' } as Action);

    expect(after.user.isLoggedIn).toBe(true);
  });

  it('preserves forFeature slices (e.g. config / public_access) on logout', () => {
    // Mirror the real store: root session slices + a separately-registered `config`
    // feature slice. The meta-reducer wraps this whole combined state.
    type TestState = State & { config: { appConfig: { publicAccess: boolean } } };
    const configReducer = (s: { appConfig: { publicAccess: boolean } } = { appConfig: { publicAccess: false } }) => s;
    const fullReducer = combineReducers({
      ...reducers,
      config: configReducer
    }) as unknown as ActionReducer<TestState>;

    const base = fullReducer(undefined, { type: '@@init' } as Action);
    const dirty: TestState = {
      ...base,
      user: { ...base.user, isLoggedIn: true },
      config: { appConfig: { publicAccess: true } }
    };

    const meta = clearStateOnLogout(fullReducer as unknown as ActionReducer<State>);
    const after = meta(dirty as unknown as State, UserActions.logoutUserSuccess()) as unknown as TestState;

    expect(after.user.isLoggedIn).toBe(false); // session slice reset
    expect(after.config.appConfig.publicAccess).toBe(true); // feature slice preserved
  });
});
