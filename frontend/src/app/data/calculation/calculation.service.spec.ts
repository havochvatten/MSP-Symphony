import { TestBed } from '@angular/core/testing';

import { CalculationService } from './calculation.service';
import { provideHttpClient } from '@angular/common/http';
import { provideMockStore } from '@ngrx/store/testing';
import { initialState as metadata } from '@data/metadata/metadata.reducers';
import { initialState as area } from '@data/area/area.reducers';
import { initialState as user } from '@data/user/user.reducers';
import { provideZonelessChangeDetection } from "@angular/core";
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { StyleVersionService } from '@data/style/style-version.service';

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

describe('CalculationService static images', () => {
  let http: HttpTestingController;
  let service: CalculationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockStore({ initialState: { metadata, area, user } }),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
        { provide: StyleVersionService, useValue: { getVersion: () => of('abc123') } }
      ]
    });
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(CalculationService);
  });

  afterEach(() => http.verify());

  it('requests result and comparison images with the style version', () => {
    service.getStaticImage('/api/calculation/diff/1/2?max=50').subscribe();
    http.expectOne((req) => req.url.startsWith('/api/calculation/diff/1/2') && req.params.get('v') === 'abc123');
  });
});
