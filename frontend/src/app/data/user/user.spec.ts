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
});
