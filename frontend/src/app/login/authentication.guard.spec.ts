import { TestBed, inject } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { AuthenticationGuard } from './authentication.guard';
import { provideZonelessChangeDetection } from "@angular/core";

describe('AuthenticationGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthenticationGuard,
        provideMockStore(),
        provideZonelessChangeDetection()
      ]
    });
  });

  it('should ...', inject([AuthenticationGuard], (guard: AuthenticationGuard) => {
    expect(guard).toBeTruthy();
  }));
});
