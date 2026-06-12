import { initialState, scenarioReducer } from './scenario.reducers';
import { Scenario } from './scenario.interfaces';
import { ListItemsSort } from '@data/common/sorting.interfaces';
import { UserActions } from '@data/user';
import { Baseline } from '@data/user/user.interfaces';

const stubScenario = { id: 1, name: 'old' } as unknown as Scenario;
const baseline: Baseline = { id: 9, name: 'B', description: '' } as Baseline;

describe('ScenarioReducer', () => {
  it('resets to initial state when the active baseline changes', () => {
    const populated = {
      ...initialState,
      scenarios: [stubScenario],
      active: 0,
      activeArea: 0,
      matrixData: { 1: {} as never },
      matricesLoading: true,
      sortScenarios: ListItemsSort.None,
      autoBatch: [42]
    };

    const _state = scenarioReducer(populated, UserActions.activeBaselineChanged({ baseline }));

    expect(_state).toEqual(initialState);
  });
});
