import { ConfigState } from './systemproperties.interfaces';
import { initialState } from './systemproperties.reducer';
import { SystemPropertiesSelectors } from './index';

const state: ConfigState = { ...initialState };

describe('SystemPropertiesSelector', () => {
  it('initial state should return false publicAccess', () => {
    expect(SystemPropertiesSelectors.selectPublicAccess.projector(state)).toEqual(false);
  });
});
