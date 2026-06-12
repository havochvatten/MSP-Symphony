import { TestBed } from '@angular/core/testing';

import { CalculationService } from './calculation.service';
import { provideHttpClient } from '@angular/common/http';
import { provideMockStore } from '@ngrx/store/testing';
import { initialState as metadata } from '@data/metadata/metadata.reducers';
import { initialState as area } from '@data/area/area.reducers';
import { initialState as user } from '@data/user/user.reducers';
import { provideZonelessChangeDetection } from "@angular/core";

describe('CalculationService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [provideMockStore({
      initialState: {
        metadata,
        area,
        user
      }}),
      provideHttpClient(),
      provideZonelessChangeDetection()
    ]
  }));

  it('should be created', () => {
    const service: CalculationService = TestBed.inject(CalculationService);
    expect(service).toBeTruthy();
  });
});
