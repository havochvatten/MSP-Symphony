import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment as env } from "@src/environments/environment";
import { BandType } from "@data/metadata/metadata.interfaces";
import { AppSettings } from "@src/app/app.settings";

@Injectable({
  providedIn: 'root'
})
export class DataLayerService {
  constructor(private http: HttpClient) {}

  public getDataLayer(baseline: string, type: BandType, bandNumber: number) {
    const url = `${env.apiBaseUrl}/datalayer/${type.toLowerCase()}/${bandNumber}/${baseline}`;
    const params = AppSettings.CLIENT_SIDE_PROJECTION ?
      undefined :
      new HttpParams().set('crs', AppSettings.MAP_PROJECTION);

    return this.http.get(url, {
      responseType: 'blob',
      observe: 'response',
      params
    });
  }
}
