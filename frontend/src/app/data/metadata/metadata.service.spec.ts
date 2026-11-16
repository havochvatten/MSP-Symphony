import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TranslateSpecModule } from '@src/testing/translate-spec.module';
import { environment as env } from '@src/environments/environment';
import MetadataService from './metadata.service';

describe('MetadataService', () => {
  let service: MetadataService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateSpecModule],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideZonelessChangeDetection()]
    });
    TestBed.inject(TranslateService).use('sv');
    service = TestBed.inject(MetadataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('asks for the metadata in the current language', () => {
    service.getMetaData('BALTIC').subscribe();

    expect(httpMock.expectOne(`${env.apiBaseUrl}/metadata/BALTIC?lang=sv`).request.method).toBe(
      'GET'
    );
  });

  it('adds the active scenario to the request', () => {
    service.getMetaData('BALTIC', 5).subscribe();

    expect(
      httpMock.expectOne(`${env.apiBaseUrl}/metadata/BALTIC?lang=sv&scenarioId=5`).request.method
    ).toBe('GET');
  });
});
