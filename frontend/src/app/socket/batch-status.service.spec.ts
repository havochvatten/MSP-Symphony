import { TestBed } from '@angular/core/testing';
import { StoreModule } from "@ngrx/store";

import { BatchStatusService } from './batch-status.service';
import { provideZonelessChangeDetection } from "@angular/core";


describe('BatchStatusService', () => {
  let service: BatchStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection()
      ],
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
