import { registerLocaleData } from '@angular/common';
import localeSv from '@angular/common/locales/sv';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslateService } from '@ngx-translate/core';
import { NEVER, Subject, of } from 'rxjs';
import { LangChangeEvent } from '@ngx-translate/core';
import { ComparisonReport } from '@data/calculation/calculation.interfaces';
import { environment as env } from '@src/environments/environment';
import { CalculationService } from '@data/calculation/calculation.service';
import { StyleVersionService } from '@data/style/style-version.service';
import { BrandingService } from '@src/app/core/branding/branding.service';
import { ReportService } from './report.service';
import { ComparisonReportComponent } from './comparison-report.component';

registerLocaleData(localeSv);

describe('ComparisonReportComponent', () => {
  const create = (version: string, langChange$: Subject<LangChangeEvent> = new Subject()) => {
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
        {
          provide: TranslateService,
          useValue: { getCurrentLang: () => 'en', onLangChange: langChange$ }
        },
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

  it('formats the chart threshold in the language that is current when it is read', () => {
    const langChange$ = new Subject<LangChangeEvent>();
    const component = create('abc123', langChange$);
    component.reportSignal.set({
      a: { chartWeightThreshold: 0.05 }
    } as unknown as ComparisonReport);
    expect(component.getChartThresholdPercentage()).toBe('5%');

    langChange$.next({ lang: 'sv', translations: {} });

    expect(component.getChartThresholdPercentage()).toBe('5\u00a0%');
  });
});
