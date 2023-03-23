import { TestBed } from '@angular/core/testing';

import { MatrixService } from './matrix.service';
import { HttpClientModule } from '@angular/common/http';
import { provideMockStore } from '@ngrx/store/testing';

describe('MatrixService', () => {
  let service: MatrixService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [provideMockStore({ initialState: { user: { baseline: undefined } } })]
    });
    service = TestBed.inject(MatrixService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
