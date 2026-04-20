import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment as env } from "@src/environments/environment";
import { BandType, HeatmapModel } from "@data/metadata/metadata.interfaces";
import { AppSettings } from "@src/app/app.settings";

@Injectable({
  providedIn: 'root'
})
export class DataLayerService {
  private readonly http = inject(HttpClient);

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

  public getHeatmapLayer(baseline: string, type: BandType, model: Exclude<HeatmapModel, 'none'>) {
    const url = `${env.apiBaseUrl}/datalayer/${type.toLowerCase()}/model/${model}/${baseline}`;
    const params = new HttpParams().set('crs', encodeURIComponent(AppSettings.MAP_PROJECTION));

    return this.http.get(url, {
      responseType: 'blob',
      observe: 'response',
      params
    });
  }
}
