import { TestBed } from '@angular/core/testing';

import { CalculationService } from './calculation.service';
import { HttpClientModule } from '@angular/common/http';
import { provideMockStore } from '@ngrx/store/testing';
import { initialState as metadata } from '@data/metadata/metadata.reducers';
import { initialState as area } from '@data/area/area.reducers';
import { initialState as user } from '@data/user/user.reducers';

describe('CalculationService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientModule],
    providers: [provideMockStore({
      initialState: {
        metadata,
        area,
        user
      }
    })]
  }));

  it('should be created', () => {
    const service: CalculationService = TestBed.inject(CalculationService);
    expect(service).toBeTruthy();
  });
});
