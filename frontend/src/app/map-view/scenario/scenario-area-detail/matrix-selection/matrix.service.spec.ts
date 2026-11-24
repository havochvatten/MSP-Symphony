import { TestBed } from '@angular/core/testing';

import { MatrixService } from './matrix.service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslateService } from '@ngx-translate/core';
import { TranslateSpecModule } from '@src/testing/translate-spec.module';
import { provideZonelessChangeDetection } from '@angular/core';
import { environment as env } from '@src/environments/environment';

describe('MatrixService', () => {
  let service: MatrixService;
  let translate: TranslateService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateSpecModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideMockStore({ initialState: { user: { baseline: undefined } } }),
        TranslateService,
        provideZonelessChangeDetection()
      ]
    });
    translate = TestBed.inject(TranslateService);
    translate.use('sv');
    service = TestBed.inject(MatrixService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('asks for the sensitivity matrix in the current language', () => {
    service.getSensitivityMatrix(7).subscribe();

    expect(
      httpMock.expectOne(`${env.apiBaseUrl}/sensitivitymatrix/id/7?lang=sv`).request.method
    ).toBe('GET');
  });

  it('follows a language change made after the service was created', () => {
    service.getSensitivityMatrix(7).subscribe();
    httpMock.expectOne(`${env.apiBaseUrl}/sensitivitymatrix/id/7?lang=sv`).flush({});

    translate.use('fr');
    service.getSensitivityMatrix(7).subscribe();

    expect(
      httpMock.expectOne(`${env.apiBaseUrl}/sensitivitymatrix/id/7?lang=fr`).request.method
    ).toBe('GET');
  });
});
