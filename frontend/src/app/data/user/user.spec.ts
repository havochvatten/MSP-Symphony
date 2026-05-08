import { userReducer, initialState } from './user.reducers';
import { User, State } from './user.interfaces';
import { UserActions, UserSelectors } from '.';

const testUser: User = {
  username: 'Test',
};

const user: User = { ...testUser };
const state: State = { ...initialState };

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

  it('should activate bootstrap load context on fetchUserForBootstrap', () => {
    expect(initialState.bootstrapLoadContextActive).toEqual(false);
    const _state = userReducer(initialState, UserActions.fetchUserForBootstrap());
    expect(_state.bootstrapLoadContextActive).toEqual(true);
  });

  it('should complete bootstrap load context on completeBootstrapLoad', () => {
    const loadingState = {
      ...initialState,
      bootstrapLoadContextActive: true
    };

    const _state = userReducer(loadingState, UserActions.completeBootstrapLoad());
    expect(_state.bootstrapLoadContextActive).toEqual(false);
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

  it('should return app bootstrap loading only when bootstrap context is active', () => {
    expect(
      UserSelectors.selectIsAppBootstrapLoading.projector(true, true)
    ).toEqual(true);
    expect(
      UserSelectors.selectIsAppBootstrapLoading.projector(false, true)
    ).toEqual(false);
  });

  it('should return initial loading when one of bootstrap-related resources is loading', () => {
    expect(
      UserSelectors.selectIsInitialLoading.projector(false, false, false, false, false, false)
    ).toEqual(false);
    expect(
      UserSelectors.selectIsInitialLoading.projector(false, false, false, true, false, false)
    ).toEqual(true);
  });
});
