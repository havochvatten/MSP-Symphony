import { areaReducer, initialState } from './area.reducers';
import { AreaActions } from '@data/area';

describe('AreaReducer', () => {
  const loadingState = () => areaReducer(initialState, AreaActions.fetchNationalAreas());

  it('sets loading true on fetchNationalAreas', () => {
    expect(loadingState().loading).toBe(true);
  });

  it('resets loading on fetchNationalAreaTypesFailure', () => {
    const done = areaReducer(
      loadingState(),
      AreaActions.fetchNationalAreaTypesFailure({ error: { status: 500, message: 'x' } })
    );
    expect(done.loading).toBe(false);
  });

  it('resets loading on fetchNationalAreaFailure', () => {
    const done = areaReducer(
      loadingState(),
      AreaActions.fetchNationalAreaFailure({ error: { status: 500, message: 'x' } })
    );
    expect(done.loading).toBe(false);
  });
});
