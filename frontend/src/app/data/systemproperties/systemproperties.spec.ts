import { ConfigState, initialState } from './systemproperties.interfaces';
import { SystemPropertiesSelectors } from './index';

const state: ConfigState = { ...initialState };

describe('SystemPropertiesSelector', () => {
  it('should return publicAccess', () => {
    expect(SystemPropertiesSelectors.selectPublicAccess.projector(state)).toEqual(false);
  });
});
