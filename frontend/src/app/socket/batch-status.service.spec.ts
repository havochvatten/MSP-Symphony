import { TestBed } from '@angular/core/testing';
import { StoreModule } from "@ngrx/store";

import { BatchStatusService } from './batch-status.service';


describe('BatchStatusService', () => {
  let service: BatchStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({},{}),
      ]
    });
    service = TestBed.inject(BatchStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
