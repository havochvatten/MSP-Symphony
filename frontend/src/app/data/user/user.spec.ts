import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import {
  provideTranslateService,
  TranslateLoader,
  TranslateService,
  TranslationObject
} from '@ngx-translate/core';
import { Observable, of, Subject } from 'rxjs';
import { initialState, userReducer } from './user.reducers';
import { Baseline, State, User } from './user.interfaces';
import { UserEffects } from './user.effects';
import UserService from './user.service';
import { UserActions, UserSelectors } from '.';
import { MetadataActions } from '@data/metadata';

const testUser: User = {
  username: 'Test'
};

const user: User = { ...testUser };
const state: State = { ...initialState };

const baselineA: Baseline = { id: 1, name: 'A', description: 'baseline A' } as Baseline;
const baselineB: Baseline = { id: 2, name: 'B', description: 'baseline B' } as Baseline;

describe('UserReducer', () => {
  it('should set loading to true on login', () => {
    expect(initialState.loading).toEqual(false);
    const _state = userReducer(initialState, UserActions.loginUser);
    expect(_state.loading).toEqual(true);
  });

  it('should set isLoggedIn to true on login success', () => {
    expect(initialState.isLoggedIn).toEqual(false);
    const _state = userReducer(initialState, UserActions.loginUserSuccess({ user }));
    expect(_state.loading).toEqual(false);
    expect(_state.isLoggedIn).toEqual(true);
    expect(_state.error).toEqual(undefined);
    expect(_state.user).toEqual(testUser);
  });

  it('should set baseline on fetchBaselineSuccess and clear loadingBaseline', () => {
    const _state = userReducer(
      initialState,
      UserActions.fetchBaselineSuccess({ baseline: baselineA })
    );
    expect(_state.baseline).toEqual(baselineA);
    expect(_state.loadingBaseline).toEqual(false);
  });

  it('should set baseline on activeBaselineChanged', () => {
    const prior = userReducer(
      initialState,
      UserActions.fetchBaselineSuccess({ baseline: baselineA })
    );
    const _state = userReducer(prior, UserActions.activeBaselineChanged({ baseline: baselineB }));
    expect(_state.baseline).toEqual(baselineB);
  });

  it('should populate availableBaselines on fetchAvailableBaselinesSuccess', () => {
    const _state = userReducer(
      initialState,
      UserActions.fetchAvailableBaselinesSuccess({ baselines: [baselineA, baselineB] })
    );
    expect(_state.availableBaselines).toEqual([baselineA, baselineB]);
  });

  it('should reset availableBaselines to empty on fetchAvailableBaselinesFailure', () => {
    const seeded = userReducer(
      initialState,
      UserActions.fetchAvailableBaselinesSuccess({ baselines: [baselineA] })
    );
    const _state = userReducer(
      seeded,
      UserActions.fetchAvailableBaselinesFailure({ error: { status: 500, message: 'boom' } })
    );
    expect(_state.availableBaselines).toEqual([]);
  });
});

describe('UserSelectors', () => {
  it('should return islogged in', () => {
    expect(UserSelectors.selectIsLoggedIn.projector(state)).toEqual(false);
    expect(
      UserSelectors.selectIsLoggedIn.projector({
        ...state,
        isLoggedIn: true
      })
    ).toEqual(true);
  });

  it('should return user', () => {
    expect(
      UserSelectors.selectUser.projector({
        ...state,
        user
      })
    ).toEqual(user);
  });

  it('should return the active baseline', () => {
    expect(UserSelectors.selectBaseline.projector(state)).toBeUndefined();
    expect(UserSelectors.selectBaseline.projector({ ...state, baseline: baselineA })).toEqual(
      baselineA
    );
  });

  it('should return available baselines, falling back to []', () => {
    expect(UserSelectors.selectAvailableBaselines.projector(state)).toEqual([]);
    expect(
      UserSelectors.selectAvailableBaselines.projector({
        ...state,
        availableBaselines: [baselineA, baselineB]
      })
    ).toEqual([baselineA, baselineB]);
  });
});

describe('UserEffects publicUserLanguageChanged$', () => {
  let actions$: Subject<Action>;
  let pending$: Subject<TranslationObject>;
  let translate: TranslateService;
  let effects: UserEffects;
  let emissions: { action: Action; langAtEmission: string | null }[];

  beforeEach(async () => {
    actions$ = new Subject<Action>();
    pending$ = new Subject<TranslationObject>();
    emissions = [];

    // 'sv' is available at once, 'en' stays pending until pending$ emits.
    const loader: TranslateLoader = {
      getTranslation: (lang: string): Observable<TranslationObject> =>
        lang === 'sv' ? of({}) : pending$
    };

    TestBed.configureTestingModule({
      providers: [
        UserEffects,
        provideRouter([]),
        provideMockActions(() => actions$),
        provideMockStore({ initialState: {} }),
        { provide: UserService, useValue: jasmine.createSpyObj('UserService', ['login']) },
        provideTranslateService({ loader: { provide: TranslateLoader, useValue: loader } })
      ]
    });

    translate = TestBed.inject(TranslateService);
    effects = TestBed.inject(UserEffects);

    translate.use('sv');
    expect(translate.getCurrentLang()).toBe('sv');

    (effects.publicUserLanguageChanged$ as Observable<Action>).subscribe((action) => {
      emissions.push({ action, langAtEmission: translate.getCurrentLang() });
    });
  });

  it('fetches metadata only after the new language is active', () => {
    translate.use('en'); // pending: the English file has not loaded yet
    actions$.next(UserActions.updatePublicUserLanguage({ locale: 'en' }));

    expect(emissions).toEqual([]);

    pending$.next({});
    pending$.complete();

    expect(emissions.length).toBe(1);
    expect(emissions[0].action).toEqual(MetadataActions.fetchMetadata());
    expect(emissions[0].langAtEmission).toBe('en');
  });

  it('fetches metadata at once when the chosen language is already active', () => {
    actions$.next(UserActions.updatePublicUserLanguage({ locale: 'sv' }));

    expect(emissions.length).toBe(1);
    expect(emissions[0].action).toEqual(MetadataActions.fetchMetadata());
    expect(emissions[0].langAtEmission).toBe('sv');
  });

  it('lets a second quick switch cancel the wait for the first', () => {
    translate.use('en'); // pending
    actions$.next(UserActions.updatePublicUserLanguage({ locale: 'en' }));
    // The user changes their mind and picks the language that is still active.
    translate.use('sv');
    actions$.next(UserActions.updatePublicUserLanguage({ locale: 'sv' }));

    expect(emissions.length).toBe(1);
    expect(emissions[0].langAtEmission).toBe('sv');

    // English becomes the active language later on (for example through another path). The
    // cancelled wait for the first switch must not fetch metadata a second time.
    translate.use('en');
    pending$.next({});
    pending$.complete();

    expect(translate.getCurrentLang()).toBe('en');
    expect(emissions.length).toBe(1);
  });
});
