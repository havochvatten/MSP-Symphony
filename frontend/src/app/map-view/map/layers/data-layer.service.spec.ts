import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { StyleVersionService } from '@data/style/style-version.service';
import { DataLayerService } from './data-layer.service';

describe('DataLayerService', () => {
  let http: HttpTestingController;

  const setup = (version: string) => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
        { provide: TranslateService, useValue: {} },
        { provide: StyleVersionService, useValue: { getVersion: () => of(version) } }
      ]
    });
    http = TestBed.inject(HttpTestingController);
    return TestBed.inject(DataLayerService);
  };

  afterEach(() => http.verify());

  it('requests band images with the style version', () => {
    setup('abc123').getDataLayer('BALTIC', 'ECOSYSTEM', 3).subscribe();
    http.expectOne(
      (req) => req.url.endsWith('/datalayer/ecosystem/3/BALTIC') && req.params.get('v') === 'abc123'
    );
  });

  it('requests summary model images with the style version', () => {
    setup('abc123').getSummaryModel('BALTIC', 'ECOSYSTEM', 'simple').subscribe();
    http.expectOne(
      (req) => req.url.endsWith('/datalayer/BALTIC/ecosystem/model/simple') && req.params.get('v') === 'abc123'
    );
  });

  it('still requests the image when the version is unavailable', () => {
    setup('').getDataLayer('BALTIC', 'ECOSYSTEM', 3).subscribe();
    const req = http.expectOne((r) => r.url.endsWith('/datalayer/ecosystem/3/BALTIC'));
    expect(req.request.params.has('v')).toBeFalse();
  });
});
