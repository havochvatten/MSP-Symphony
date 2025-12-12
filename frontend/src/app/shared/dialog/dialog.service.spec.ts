import { TestBed } from '@angular/core/testing';

import { DialogService } from './dialog.service';
import { provideZonelessChangeDetection } from "@angular/core";

describe('DialogService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection()]
  }));

  it('should be created', () => {
    const service: DialogService = TestBed.inject(DialogService);
    expect(service).toBeTruthy();
  });
});
