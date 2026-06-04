import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ConfigService } from './systemproperties.service';
import * as ConfigActions from './systemproperties.actions';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class ConfigEffects {
  loadConfig$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ConfigActions.loadConfig),
      mergeMap(() =>
        this.configService.loadConfig().pipe(
          map((config) => ConfigActions.loadConfigSuccess({ config: config })),
          catchError((error) => of(ConfigActions.loadConfigFailure({ error: error.message })))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private configService: ConfigService
  ) {}
}
