import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment as env } from '@src/environments/environment';
import { BandType } from '@data/metadata/metadata.interfaces';
import { AppSettings } from '@src/app/app.settings';
import { ModelDescriptionDialogData } from '@src/app/map-view/band-selection/summary-model-selection/summary-model-dialog/summary-model-dialog.component';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SummaryModel, SummaryModelCategory } from '@data/calculation/calculation.interfaces';

@Injectable({
  providedIn: 'root'
})
export class DataLayerService {
  private readonly http = inject(HttpClient);

  private readonly summaryModelsCache = new Map<string, string[]>();

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

    return this.http.get<ModelDescriptionDialogData>(url);
  }

  public getSummaryModels(
    baseline: string,
    summaryModelCategory: SummaryModelCategory
  ): Observable<string[]> {
    const category = summaryModelCategory.toLowerCase(); // 'ecosystem' | 'pressure'
    const cacheKey = `${baseline.toLowerCase()}:${category}`;

    if (this.summaryModelsCache.has(cacheKey)) {
      return of(this.summaryModelsCache.get(cacheKey)!);
    }

    const url = `${env.apiBaseUrl}/datalayer/${baseline}/${category}/models`;

    return this.http.get<string[]>(url).pipe(
      tap((models) => {
        this.summaryModelsCache.set(cacheKey, models);
      })
    );
  }
}
