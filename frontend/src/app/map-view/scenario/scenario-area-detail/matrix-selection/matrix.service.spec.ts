import { TestBed } from '@angular/core/testing';

import { MatrixService } from './matrix.service';
import { HttpClientModule } from '@angular/common/http';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslateModule, TranslateService } from "@ngx-translate/core";

describe('MatrixService', () => {
  let service: MatrixService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, TranslateModule.forRoot()],
      providers: [
        provideMockStore({ initialState: { user: { baseline: undefined } } }),
        TranslateService]
    });
    service = TestBed.inject(MatrixService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
