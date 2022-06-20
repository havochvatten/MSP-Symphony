import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../environments/environment';
import { MetadataInterfaces } from './data/metadata/';
import { metadataReducer } from './data/metadata/metadata.reducers';
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

export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];
