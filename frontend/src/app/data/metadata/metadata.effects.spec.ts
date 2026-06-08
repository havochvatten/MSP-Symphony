import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Observable, of, Subject } from 'rxjs';
import { Action } from '@ngrx/store';

import { MetadataEffects } from './metadata.effects';
import { MetadataActions } from './';
import { CalculationActions } from '@data/calculation';
import { DataLayerService } from '@src/app/map-view/map/layers/data-layer.service';
import MetadataService from './metadata.service';
import { ModelDescriptionDialogData } from '@src/app/map-view/band-selection/summary-model-selection/summary-model-dialog/summary-model-dialog.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

const MOCK_DESC: ModelDescriptionDialogData = { title: 'test', steps: [] };

describe('MetadataEffects — fetchSummaryModelDescriptions$', () => {
  let actions$: Subject<Action>;
  let effects: MetadataEffects;
  let dataLayerService: jasmine.SpyObj<DataLayerService>;

  beforeEach(() => {
    actions$ = new Subject<Action>();
    dataLayerService = jasmine.createSpyObj('DataLayerService', ['getSummaryModelDescription']);
    dataLayerService.getSummaryModelDescription.and.returnValue(of(MOCK_DESC));

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        MetadataEffects,
        provideMockActions(() => actions$),
        provideMockStore({ initialState: { user: { baseline: { name: 'BASELINE2019' } } } }),
        { provide: DataLayerService, useValue: dataLayerService },
        {
          provide: MetadataService,
          useValue: jasmine.createSpyObj('MetadataService', ['getMetaData'])
        }
      ]
    });

    effects = TestBed.inject(MetadataEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  it('fetches model descriptions for each model and dispatches success action', (done) => {
    const dispatched: Action[] = [];
    (effects.fetchSummaryModelDescriptions$ as Observable<Action>).subscribe((action) => {
      dispatched.push(action);
    });

    // Trigger the effect by dispatching fetchSummaryModelsSuccess
    actions$.next(
      CalculationActions.fetchSummaryModelsSuccess({
        baselineName: 'BASELINE2019',
        category: 'ECOSYSTEM',
        models: [
          { key: 'simple', name: 'Simple model' },
          { key: 'balanced', name: 'Balanced model' }
        ]
      })
    );

    // Allow forkJoin to complete
    setTimeout(() => {
      expect(dispatched.length).toBe(1);
      const action = dispatched[0] as ReturnType<
        typeof MetadataActions.fetchSummaryModelDescriptionsSuccess
      >;
      expect(action.type).toBe(MetadataActions.fetchSummaryModelDescriptionsSuccess.type);
      expect(action.category).toBe('ECOSYSTEM');
      expect(Object.keys(action.descriptions)).toEqual(jasmine.arrayContaining(['simple', 'balanced']));
      done();
    }, 50);
  });

  it('dispatches failure action when getSummaryModelDescription throws', (done) => {
    dataLayerService.getSummaryModelDescription.and.returnValue(
      new Observable((obs) => obs.error(new Error('HTTP error')))
    );

    const dispatched: Action[] = [];
    (effects.fetchSummaryModelDescriptions$ as Observable<Action>).subscribe((action) => {
      dispatched.push(action);
    });

    actions$.next(
      CalculationActions.fetchSummaryModelsSuccess({
        baselineName: 'BASELINE2019',
        category: 'ECOSYSTEM',
        models: [{ key: 'simple', name: 'Simple model' }]
      })
    );

    setTimeout(() => {
      expect(dispatched.length).toBe(1);
      expect(dispatched[0].type).toBe(MetadataActions.fetchSummaryModelDescriptionsFailure.type);
      done();
    }, 50);
  });
});
