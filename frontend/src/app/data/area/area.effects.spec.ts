import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { Action } from '@ngrx/store';
import { Observable, of, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { AreaEffects } from './area.effects';
import { AreaActions } from '@data/area';
import AreaService from './area.service';

describe('AreaEffects', () => {
  let effects: AreaEffects;
  let actions$: Observable<Action>;
  let areaServiceStub: Partial<AreaService>;

  beforeEach(() => {
    areaServiceStub = {
      getNationalAreaTypes: () => throwError(() => ({ status: 500, error: 'x' })),
      getNationalAreasData: () => throwError(() => ({ status: 500, error: 'x' }))
    };

    TestBed.configureTestingModule({
      providers: [
        AreaEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        { provide: AreaService, useValue: areaServiceStub },
        { provide: TranslateService, useValue: { currentLang: 'en', instant: (k: string) => k } }
      ]
    });

    effects = TestBed.inject(AreaEffects);
  });

  it('fetchNationalAreas$ dispatches fetchNationalAreaTypesFailure when the types request errors', (done) => {
    actions$ = of(AreaActions.fetchNationalAreas());

    effects.fetchNationalAreas$.subscribe((action: Action) => {
      expect(action).toEqual(
        AreaActions.fetchNationalAreaTypesFailure({ error: { status: 500, message: 'x' } })
      );
      done();
    });
  });

  it('fetchNationalArea$ dispatches fetchNationalAreaFailure when the area request errors', (done) => {
    actions$ = of(AreaActions.fetchNationalArea({ areaType: 'county' }));

    effects.fetchNationalArea$.subscribe((action: Action) => {
      expect(action).toEqual(
        AreaActions.fetchNationalAreaFailure({ error: { status: 500, message: 'x' } })
      );
      done();
    });
  });
});
