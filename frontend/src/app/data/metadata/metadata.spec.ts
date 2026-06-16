import { metadataReducer, initialState } from './metadata.reducers';
import { MetadataActions } from '@data/metadata';
import { Groups } from './metadata.interfaces';

const emptyMeta = { ecoComponent: {} as Groups, pressureComponent: {} as Groups };

describe('MetadataReducer', () => {
  const loadingState = () =>
    metadataReducer(initialState, MetadataActions.fetchMetadataForBaseline({ baselineName: 'B' }));

  it('sets loading true on fetchMetadataForBaseline', () => {
    expect(loadingState().loading).toBe(true);
  });

  it('resets loading on fetchMetadataSuccess', () => {
    const done = metadataReducer(
      loadingState(),
      MetadataActions.fetchMetadataSuccess({ metadata: emptyMeta })
    );
    expect(done.loading).toBe(false);
  });

  it('resets loading on fetchSparseMetadataSuccess', () => {
    const done = metadataReducer(
      loadingState(),
      MetadataActions.fetchSparseMetadataSuccess({ metadata: emptyMeta })
    );
    expect(done.loading).toBe(false);
  });

  it('resets loading on fetchMetadataFailure', () => {
    const done = metadataReducer(
      loadingState(),
      MetadataActions.fetchMetadataFailure({ error: { status: 500, message: 'boom' } })
    );
    expect(done.loading).toBe(false);
  });
});
