import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { environment as env } from '@src/environments/environment';
import { ReportService } from './report.service';

describe('ReportService', () => {
  let service: ReportService;
  let translate: TranslateService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideZonelessChangeDetection()]
    });
    translate = TestBed.inject(TranslateService);
    translate.use('sv');
    service = TestBed.inject(ReportService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getReport', () => {
    it('asks for the report in the current language', () => {
      service.getReport('42').subscribe();

      expect(httpMock.expectOne(`${env.apiBaseUrl}/report/42?lang=sv`).request.method).toBe('GET');
    });

    it('follows a language change made after the service was created', () => {
      service.getReport('42').subscribe();
      httpMock.expectOne(`${env.apiBaseUrl}/report/42?lang=sv`).flush({});

      translate.use('fr');
      service.getReport('43').subscribe();

      expect(httpMock.expectOne(`${env.apiBaseUrl}/report/43?lang=fr`).request.method).toBe('GET');
    });
  });

  describe('getComparisonReport between two reports', () => {
    it('asks for the comparison in the current language', () => {
      service.getComparisonReport('1', '2', false).subscribe();

      expect(
        httpMock.expectOne(`${env.apiBaseUrl}/report/comparison/1/2?lang=sv`).request.method
      ).toBe('GET');
    });

    it('follows a language change made after the service was created', () => {
      service.getComparisonReport('1', '2', false).subscribe();
      httpMock.expectOne(`${env.apiBaseUrl}/report/comparison/1/2?lang=sv`).flush({});

      translate.use('fr');
      service.getComparisonReport('1', '2', false).subscribe();

      expect(
        httpMock.expectOne(`${env.apiBaseUrl}/report/comparison/1/2?lang=fr`).request.method
      ).toBe('GET');
    });
  });

  describe('getComparisonReport against the baseline, reversed', () => {
    it('asks for the comparison in the current language', () => {
      service.getComparisonReport('1', null, true).subscribe();

      expect(
        httpMock.expectOne(`${env.apiBaseUrl}/report/comparison/1?lang=sv&reverse=true`).request
          .method
      ).toBe('GET');
    });

    it('follows a language change made after the service was created', () => {
      service.getComparisonReport('1', null, true).subscribe();
      httpMock.expectOne(`${env.apiBaseUrl}/report/comparison/1?lang=sv&reverse=true`).flush({});

      translate.use('fr');
      service.getComparisonReport('1', null, true).subscribe();

      expect(
        httpMock.expectOne(`${env.apiBaseUrl}/report/comparison/1?lang=fr&reverse=true`).request
          .method
      ).toBe('GET');
    });
  });
});
