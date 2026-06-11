import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { BandSelectionComponent } from './band-selection.component';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';
import { SharedModule } from '@shared/shared.module';
import { provideMockStore } from '@ngrx/store/testing';
import { initialState as area } from '@data/area/area.reducers';
import { initialState as scenario } from '@data/scenario/scenario.reducers';
import { initialState as calculation } from '@data/calculation/calculation.reducers';
import { SelectionLayoutComponent } from '../selection-layout/selection-layout.component';
import { StoreModule } from "@ngrx/store";
import { provideZonelessChangeDetection } from "@angular/core";

describe('BandSelectionComponent', () => {
  let fixture: ComponentFixture<BandSelectionComponent>,
      component: BandSelectionComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BandSelectionComponent, SelectionLayoutComponent],
      imports: [
        SharedModule,
        TranslationSetupModule,
        StoreModule.forRoot({}, {}),
      ],
      providers: [
        provideMockStore({
          initialState: {
            area: area,
            scenario: scenario,
            user: {},
            calculation: calculation
          }
        }),
        provideZonelessChangeDetection()
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BandSelectionComponent)
    component = fixture.componentInstance;
    fixture.detectChanges();
  })

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
