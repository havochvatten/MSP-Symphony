import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { concatMap, map } from 'rxjs/operators';
import * as uuid from 'uuid/v4';

import { MessageActions } from './';

import { MetadataActions } from '@data/metadata';
import { AreaActions } from '@data/area';
import { UserActions } from '@data/user';
import { ScenarioActions } from "@data/scenario";

@Injectable()
export class MessageEffects {
  constructor(private actions$: Actions) {}

  @Effect()
  catchRequestFailure$ = this.actions$.pipe(
    ofType(
      AreaActions.fetchNationalAreaFailure,
      AreaActions.fetchUserDefinedAreasFailure,
      AreaActions.createUserDefinedAreaFailure,
      AreaActions.deleteUserDefinedAreaFailure,
      MetadataActions.fetchMetadataFailure,
      ScenarioActions.fetchAreaMatricesFailure,
      ScenarioActions.fetchScenariosFailure,
      ScenarioActions.deleteScenarioFailure,
      ScenarioActions.saveScenarioFailure
    ),
    map(({ error: { status, message } }) => {
      if (status !== 401) {
        const msg = typeof message == 'string' ? message : message['errorMessage']
        return [
          MessageActions.addPopupMessage({
            message: {
              type: 'ERROR',
              message: msg,
              uuid: uuid()
            }
          })
        ];
      } else {
        return [
          MessageActions.addPopupMessage({
            message: {
              type: 'WARNING',
              title: 'Not logged in',
              message: 'Your session has expired. Please log in.',
              uuid: uuid()
            }
          }),
          UserActions.navigateTo({ url: '/login' })
        ];
      }
    }),
    concatMap(actions => actions)
  );
}
