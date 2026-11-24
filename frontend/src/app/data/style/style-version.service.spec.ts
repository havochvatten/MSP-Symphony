import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { environment as env } from '@src/environments/environment';
import { StyleVersionService } from './style-version.service';

describe('StyleVersionService', () => {
  let service: StyleVersionService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideZonelessChangeDetection()]
    });
    service = TestBed.inject(StyleVersionService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('fetches the version once and shares it', () => {
    const received: string[] = [];
    service.getVersion().subscribe((v) => received.push(v));
    service.getVersion().subscribe((v) => received.push(v));

    http.expectOne(`${env.apiBaseUrl}/legend/style-version`).flush({ version: 'abc123' });

    expect(received).toEqual(['abc123', 'abc123']);
  });

  it('falls back to an empty version when the request fails', () => {
    const received: string[] = [];
    service.getVersion().subscribe((v) => received.push(v));

    http
      .expectOne(`${env.apiBaseUrl}/legend/style-version`)
      .flush('error', { status: 500, statusText: 'Server Error' });

    expect(received).toEqual(['']);
  });

  it('asks again after a failed request instead of keeping the empty version', () => {
    const received: string[] = [];
    service.getVersion().subscribe((v) => received.push(v));
    http
      .expectOne(`${env.apiBaseUrl}/legend/style-version`)
      .flush('error', { status: 500, statusText: 'Server Error' });

    service.getVersion().subscribe((v) => received.push(v));
    http.expectOne(`${env.apiBaseUrl}/legend/style-version`).flush({ version: 'abc123' });

    expect(received).toEqual(['', 'abc123']);
  });
});
