import { initialState, userReducer } from './user.reducers';
import { Baseline, State, User } from './user.interfaces';
import { UserActions, UserSelectors } from '.';

const testUser: User = {
  username: 'Test'
};

const user: User = { ...testUser };
const state: State = { ...initialState };

const baselineA: Baseline = { id: 1, name: 'A', description: 'baseline A' } as Baseline;
const baselineB: Baseline = { id: 2, name: 'B', description: 'baseline B' } as Baseline;

describe('UserReducer', () => {
  it('should set loading to true on login', () => {
    expect(initialState.loading).toEqual(false);
    const _state = userReducer(initialState, UserActions.loginUser);
    expect(_state.loading).toEqual(true);
  });

  it('should set isLoggedIn to true on login success', () => {
    expect(initialState.isLoggedIn).toEqual(false);
    const _state = userReducer(initialState, UserActions.loginUserSuccess({ user }));
    expect(_state.loading).toEqual(false);
    expect(_state.isLoggedIn).toEqual(true);
    expect(_state.error).toEqual(undefined);
    expect(_state.user).toEqual(testUser);
  });

  it('should set baseline on fetchBaselineSuccess and clear loadingBaseline', () => {
    const _state = userReducer(
      initialState,
      UserActions.fetchBaselineSuccess({ baseline: baselineA })
    );
    expect(_state.baseline).toEqual(baselineA);
    expect(_state.loadingBaseline).toEqual(false);
  });

  it('should set baseline on activeBaselineChanged', () => {
    const prior = userReducer(
      initialState,
      UserActions.fetchBaselineSuccess({ baseline: baselineA })
    );
    const _state = userReducer(prior, UserActions.activeBaselineChanged({ baseline: baselineB }));
    expect(_state.baseline).toEqual(baselineB);
  });

  it('should populate availableBaselines on fetchAvailableBaselinesSuccess', () => {
    const _state = userReducer(
      initialState,
      UserActions.fetchAvailableBaselinesSuccess({ baselines: [baselineA, baselineB] })
    );
    expect(_state.availableBaselines).toEqual([baselineA, baselineB]);
  });

  it('should reset availableBaselines to empty on fetchAvailableBaselinesFailure', () => {
    const seeded = userReducer(
      initialState,
      UserActions.fetchAvailableBaselinesSuccess({ baselines: [baselineA] })
    );
    const _state = userReducer(
      seeded,
      UserActions.fetchAvailableBaselinesFailure({ error: { status: 500, message: 'boom' } })
    );
    expect(_state.availableBaselines).toEqual([]);
  });
});

describe('UserSelectors', () => {
  it('should return islogged in', () => {
    expect(UserSelectors.selectIsLoggedIn.projector(state)).toEqual(false);
    expect(
      UserSelectors.selectIsLoggedIn.projector({
        ...state,
        isLoggedIn: true
      })
    ).toEqual(true);
  });

  it('should return user', () => {
    expect(
      UserSelectors.selectUser.projector({
        ...state,
        user
      })
    ).toEqual(user);
  });

  it('should return the active baseline', () => {
    expect(UserSelectors.selectBaseline.projector(state)).toBeUndefined();
    expect(UserSelectors.selectBaseline.projector({ ...state, baseline: baselineA })).toEqual(
      baselineA
    );
  });

  it('should return available baselines, falling back to []', () => {
    expect(UserSelectors.selectAvailableBaselines.projector(state)).toEqual([]);
    expect(
      UserSelectors.selectAvailableBaselines.projector({
        ...state,
        availableBaselines: [baselineA, baselineB]
      })
    ).toEqual([baselineA, baselineB]);
  });
});
