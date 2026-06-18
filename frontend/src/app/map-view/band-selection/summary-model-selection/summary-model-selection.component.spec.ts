import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { StoreModule } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { SummaryModelSelectionComponent } from './summary-model-selection.component';
import { CalculationActions } from '@data/calculation';
import { initialState as calculation } from '@data/calculation/calculation.reducers';

describe('SummaryModelSelectionComponent', () => {
  let fixture: ComponentFixture<SummaryModelSelectionComponent>;
  let component: SummaryModelSelectionComponent;
  let store: MockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({}, {}),
        TranslateModule.forRoot()
      ],
      providers: [
        TranslateService,
        provideMockStore({
          initialState: { calculation }
        }),
        provideZonelessChangeDetection()
      ],
      declarations: [SummaryModelSelectionComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(SummaryModelSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getSummaryModelCategory maps ecoComponents to ECOSYSTEM', () => {
    expect(component.getSummaryModelCategory('ecoComponents')).toBe('ECOSYSTEM');
  });

  it('getSummaryModelCategory maps pressures to PRESSURE', () => {
    expect(component.getSummaryModelCategory('pressures')).toBe('PRESSURE');
  });

  it('onSummaryModelChange dispatches setSummaryModel action', () => {
    const dispatchSpy = spyOn(store, 'dispatch');
    component.modelCategory = 'ecoComponents';

    component.onSummaryModelChange('simple');

    expect(dispatchSpy).toHaveBeenCalledWith(
      CalculationActions.setSummaryModel({ category: 'ECOSYSTEM', model: 'simple' })
    );
  });

  it('toggleSummaryModel dispatches none when model is already selected', () => {
    const dispatchSpy = spyOn(store, 'dispatch');
    component.modelCategory = 'ecoComponents';
    component.currentSummaryModel = 'simple';

    component.toggleSummaryModel('simple');

    expect(dispatchSpy).toHaveBeenCalledWith(
      CalculationActions.setSummaryModel({ category: 'ECOSYSTEM', model: 'none' })
    );
  });

  it('isSummaryModelSelected returns true only for current model', () => {
    component.currentSummaryModel = 'balanced';
    expect(component.isSummaryModelSelected('balanced')).toBeTrue();
    expect(component.isSummaryModelSelected('simple')).toBeFalse();
  });
});
