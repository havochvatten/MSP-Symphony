import { ActionReducer, ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../environments/environment';
// Import the action directly (not via the @data/user barrel) to avoid an import
// cycle: the barrel pulls in effects that import State from this file.
import { logoutUserSuccess } from '@data/user/user.actions';
import { MetadataInterfaces } from './data/metadata/';
import { metadataReducer } from '@data/metadata/metadata.reducers';
import { UserInterfaces } from '@data/user';
import { userReducer } from '@data/user/user.reducers';
import { AreaInterfaces } from '@data/area';
import { areaReducer } from '@data/area/area.reducers';
import { MessageInterfaces } from '@data/message';
import { messageReducer } from '@data/message/message.reducers';
import { CalculationInterfaces } from '@data/calculation';
import { calculationReducer } from '@data/calculation/calculation.reducers';
import { ScenarioInterfaces } from "@data/scenario";
import { scenarioReducer } from "@data/scenario/scenario.reducers";

export interface State {
  metadata: MetadataInterfaces.State;
  user: UserInterfaces.State;
  area: AreaInterfaces.State;
  message: MessageInterfaces.State;
  calculation: CalculationInterfaces.State;
  scenario: ScenarioInterfaces.State;
}

export const reducers: ActionReducerMap<State> = {
  metadata: metadataReducer,
  user: userReducer,
  area: areaReducer,
  message: messageReducer,
  calculation: calculationReducer,
  scenario: scenarioReducer
};

// On logout, reset the root session slices to their initial values so the next view
// (e.g. the public "tittskåp" view reached via logout) does not inherit the previous
// user's session data. Only the slices in `reducers` are cleared; forFeature slices such
// as `config`/systemproperties (which holds public_access) are preserved, so the logout
// navigation and PublicGuard keep working. Note that forRoot meta-reducers wrap the whole
// combined state, so passing `undefined` here would also wipe those feature slices.
export function clearStateOnLogout(reducer: ActionReducer<State>): ActionReducer<State> {
  const rootSliceKeys = Object.keys(reducers);
  return (state, action) => {
    if (action.type === logoutUserSuccess.type && state) {
      const preserved = { ...state } as Record<string, unknown>;
      for (const key of rootSliceKeys) {
        delete preserved[key];
      }
      return reducer(preserved as unknown as State, action);
    }
    return reducer(state, action);
  };
}

export const metaReducers: MetaReducer<State>[] = [clearStateOnLogout];
