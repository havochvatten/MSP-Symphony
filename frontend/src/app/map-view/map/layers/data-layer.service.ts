import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment as env } from '@src/environments/environment';
import { BandType } from '@data/metadata/metadata.interfaces';
import { AppSettings } from '@src/app/app.settings';
import { ModelDescriptionDialogData } from '@src/app/map-view/band-selection/summary-model-selection/summary-model-dialog/summary-model-dialog.component';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SummaryModel, SummaryModelCategory, SummaryModelOption } from '@data/calculation/calculation.interfaces';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class DataLayerService {
  private readonly http = inject(HttpClient);
  private readonly translate = inject(TranslateService);

  private readonly summaryModelsCache = new Map<string, SummaryModelOption[]>();

  public getDataLayer(baseline: string, type: BandType, bandNumber: number) {
    const url = `${env.apiBaseUrl}/datalayer/${type.toLowerCase()}/${bandNumber}/${baseline}`;
    // const params = AppSettings.CLIENT_SIDE_PROJECTION ?
    //       undefined :
    //       new HttpParams().set('crs', encodeURIComponent(AppSettings.MAP_PROJECTION));
    const params = new HttpParams().set('crs', encodeURIComponent(AppSettings.MAP_PROJECTION));

    return this.http.get(url, {
      responseType: 'blob',
      observe: 'response',
      params
    });
  }

  public getSummaryModel(
    baseline: string,
    summaryModelCategory: SummaryModelCategory,
    model: Exclude<SummaryModel, 'none'>
  ) {
    const url = `${env.apiBaseUrl}/datalayer/${baseline}/${summaryModelCategory.toLowerCase()}/model/${model}`;
    const params = new HttpParams().set('crs', encodeURIComponent(AppSettings.MAP_PROJECTION));

    return this.http.get(url, {
      responseType: 'blob',
      observe: 'response',
      params
    });
  }

  public getSummaryModelDescription(
    baseline: string,
    summaryModelCategory: SummaryModelCategory,
    model: Exclude<SummaryModel, 'none'>
  ) {
    const url = `${env.apiBaseUrl}/datalayer/${baseline}/${summaryModelCategory.toLowerCase()}/model/${model}/description`;
    const params = new HttpParams().set('locale', this.translate.currentLang);

    return this.http.get<ModelDescriptionDialogData>(url, { params });
  }

  public getSummaryModels(
    baseline: string,
    summaryModelCategory: SummaryModelCategory
  ): Observable<SummaryModelOption[]> {
    const category = summaryModelCategory.toLowerCase(); // 'ecosystem' | 'pressure'
    const locale = this.translate.currentLang;
    // Locale is part of the cache key: the picker labels are localized, and a language
    // switch re-runs this fetch — without the locale the cache would serve stale names.
    const cacheKey = `${baseline.toLowerCase()}:${category}:${locale}`;

    if (this.summaryModelsCache.has(cacheKey)) {
      return of(this.summaryModelsCache.get(cacheKey)!);
    }

    const url = `${env.apiBaseUrl}/datalayer/${baseline}/${category}/models`;
    const params = new HttpParams().set('locale', locale);

    return this.http.get<SummaryModelOption[]>(url, { params }).pipe(
      tap((models) => {
        this.summaryModelsCache.set(cacheKey, models);
      })
    );
  }
}
