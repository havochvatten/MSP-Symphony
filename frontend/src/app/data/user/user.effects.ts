import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import {
  catchError,
  concatMap,
  debounceTime,
  filter,
  map,
  mergeMap,
  take,
  tap,
  withLatestFrom
} from 'rxjs/operators';
import { State } from '@src/app/app-reducer';
import UserService from './user.service';
import { UserActions, UserSelectors } from './';
import { AreaActions } from '@data/area';
import { MetadataActions } from '@data/metadata';
import { CalculationActions } from '@data/calculation';
import { ScenarioActions } from '@data/scenario';
import { LegendType } from '@data/calculation/calculation.interfaces';
import { UserSettings } from '@data/user/user.interfaces';
import { selectPublicAccess } from '@data/systemproperties/systemproperties.selectors';

const legendTypes: LegendType[] = ['result', 'ecosystem', 'pressure'];

@Injectable()
export class UserEffects {
  private readonly actions$ = inject(Actions);
  private readonly store$ = inject<Store<State>>(Store);
  private readonly configStore = inject(Store);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  loginUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loginUser),
      withLatestFrom(this.store$),
      mergeMap(([{ username, password }, state]) =>
        this.userService.login(username, password).pipe(
          map((user) => UserActions.loginUserSuccess({ user })),
          catchError((error) =>
            of(
              UserActions.loginUserFailure({
                error: {
                  status: error.status,
                  message: error.error?.errorMessage ?? error.message
                }
              })
            )
          )
        )
      )
    )
  );

  logoutUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.logoutUser),
      mergeMap(() =>
        this.userService.logout().pipe(
          map(() => UserActions.logoutUserSuccess()),
          catchError((error) =>
            of(
              UserActions.logoutUserFailure({
                error: {
                  status: error.status,
                  message: error.error
                }
              })
            )
          )
        )
      )
    )
  );

  logoutUserSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.logoutUserSuccess),
      withLatestFrom(this.configStore.select(selectPublicAccess)),
      map(([, publicAccess]) =>
        publicAccess
          ? UserActions.navigateTo({ url: '/public' })
          : UserActions.navigateTo({ url: '/login' })
      )
    )
  );

  fetchUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.fetchUser, UserActions.fetchUserSettings),
      mergeMap((action) =>
        this.userService.fetchUser().pipe(
          map((user) => {
            return action.type === UserActions.fetchUserSettings.type
              ? UserActions.fetchUserSettingsSuccess({ user })
              : UserActions.fetchUserSuccess({ user });
          }),
          catchError((error) =>
            of(
              UserActions.fetchUserFailure({
                error: {
                  status: error.status,
                  message: error.error
                }
              })
            )
          )
        )
      )
    )
  );

  fetchUserFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.fetchUserFailure),
      map(() => UserActions.navigateTo({ url: '/login' }))
    )
  );

  navigateTo$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(UserActions.navigateTo),
        tap(({ url }) => this.router.navigateByUrl(url))
      ),
    { dispatch: false }
  );

  userIsLoggedIn$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.fetchUserSuccess, UserActions.loginUserSuccess),
      concatMap(() => [
        AreaActions.fetchNationalAreas(),
        AreaActions.fetchUserDefinedAreas(),
        AreaActions.fetchBoundaries(),
        UserActions.fetchBaseline(),
        UserActions.fetchAvailableBaselines(),
        CalculationActions.fetchCompoundComparisons(),
        ...legendTypes.map((legendType) => CalculationActions.fetchLegend({ legendType }))
      ])
    )
  );

  baselineIsFetched$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.fetchBaseline),
      mergeMap(() =>
        this.userService.fetchBaseline().pipe(
          map((baseline) => UserActions.fetchBaselineSuccess({ baseline: baseline })),
          catchError((error) =>
            of(
              UserActions.fetchBaselineFailure({
                error: {
                  status: error.status,
                  message: error.error
                }
              })
            )
          )
        )
      )
    )
  );

  currentBaselineIsFetched$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.fetchCurrentBaseline),
      mergeMap(() =>
        this.userService.fetchCurrentBaseline().pipe(
          map((baseline) => UserActions.fetchBaselineSuccess({ baseline: baseline })),
          catchError((error) =>
            of(
              UserActions.fetchBaselineFailure({
                error: {
                  status: error.status,
                  message: error.error
                }
              })
            )
          )
        )
      )
    )
  );

  updateUserSettings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.updateUserSettings),
      mergeMap((settings) =>
        this.userService.updateSettings(settings as UserSettings).pipe(
          mergeMap(() => {
            if (settings.activeBaselineId !== undefined) {
              return this.userService
                .fetchBaseline()
                .pipe(
                  mergeMap((baseline) => [
                    UserActions.fetchBaselineSuccess({ baseline }),
                    UserActions.activeBaselineChanged({ baseline })
                  ])
                );
            }
            return of(
              settings.locale !== undefined
                ? UserActions.fetchUser()
                : UserActions.fetchUserSettings()
            );
          }),
          catchError((error) =>
            settings.activeBaselineId !== undefined
              ? of(
                  UserActions.fetchBaselineFailure({
                    error: {
                      status: error.status,
                      message: error.error?.errorMessage ?? error.message
                    }
                  })
                )
              : of(
                  UserActions.fetchUserFailure({
                    error: {
                      status: error.status,
                      message: error.error?.errorMessage ?? error.message
                    }
                  })
                )
          )
        )
      )
    )
  );

  availableBaselinesAreFetched$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.fetchAvailableBaselines),
      mergeMap(() =>
        this.userService.fetchBaselines().pipe(
          map((baselines) => UserActions.fetchAvailableBaselinesSuccess({ baselines })),
          catchError((error) =>
            of(
              UserActions.fetchAvailableBaselinesFailure({
                error: { status: error.status, message: error.error }
              })
            )
          )
        )
      )
    )
  );

  activeBaselineChanged$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.activeBaselineChanged),
      concatMap(() => [
        MetadataActions.fetchMetadata(),
        ScenarioActions.closeActiveScenario(),
        ScenarioActions.fetchScenarios(),
        CalculationActions.setVisibleResultLayers({ visibleResults: [] }),
        CalculationActions.resetComparisonLegend(),
        CalculationActions.fetchCalculations(),
        CalculationActions.fetchCompoundComparisons(),
        AreaActions.fetchBoundaries()
      ])
    )
  );

  fetchedMetadata$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.fetchBaselineSuccess),
      map((props) =>
        MetadataActions.fetchMetadataForBaseline({ baselineName: props.baseline.name })
      )
    )
  );

  // Navigate after login has occurred and all relevant resources are fully loaded
  navigateAfterInitialLoad$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loginUserSuccess),
      concatMap(() =>
        this.store$.select(UserSelectors.selectIsInitialLoading).pipe(
          debounceTime(800), // wait until loading is stable and false
          filter((isLoading) => !isLoading),
          take(1)
        )
      ),
      withLatestFrom(this.store$),
      map(([, state]) => UserActions.navigateTo({ url: state.user.redirectUrl || '/map' }))
    )
  );

  userIsPublic$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.createPublicUser),
      concatMap(() => [
        UserActions.fetchAvailableBaselines(),
        UserActions.fetchCurrentBaseline(),
        AreaActions.fetchBoundaries(),
        MetadataActions.fetchMetadata(),
        ...legendTypes.map((legendType) => CalculationActions.fetchPublicLegend({ legendType }))
      ])
    )
  );
}
