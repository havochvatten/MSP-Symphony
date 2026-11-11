import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslateService } from '@ngx-translate/core';
import { NEVER, of } from 'rxjs';
import { environment as env } from '@src/environments/environment';
import { CalculationService } from '@data/calculation/calculation.service';
import { StyleVersionService } from '@data/style/style-version.service';
import { BrandingService } from '@src/app/core/branding/branding.service';
import { ReportService } from './report.service';
import { ComparisonReportComponent } from './comparison-report.component';

describe('ComparisonReportComponent', () => {
  const create = (version: string) => {
    TestBed.configureTestingModule({
      declarations: [ComparisonReportComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideMockStore({ initialState: {} }),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ aId: '1', bId: '2', maxValue: '50' }),
              queryParams: {}
            }
          }
        },
        { provide: TranslateService, useValue: { currentLang: 'en' } },
        { provide: ReportService, useValue: { getComparisonReport: () => NEVER } },
        { provide: CalculationService, useValue: { getComparisonLegend: () => NEVER } },
        { provide: BrandingService, useValue: {} },
        { provide: StyleVersionService, useValue: { getVersion: () => of(version) } }
      ]
    }).overrideTemplate(ComparisonReportComponent, '');
    return TestBed.createComponent(ComparisonReportComponent).componentInstance;
  };

  it('requests the comparison image with the style version', () => {
    expect(create('abc123').comparisonImageUrl()).toBe(
      `${env.apiBaseUrl}/calculation/diff/1/2?max=50&v=abc123`
    );
  });

  it('requests the comparison image without a version when it is unavailable', () => {
    expect(create('').comparisonImageUrl()).toBe(`${env.apiBaseUrl}/calculation/diff/1/2?max=50`);
  });
});
