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

  public getDataLayer(baseline: string, type: BandType, bandNumber: number, altId: string | null) {
    const url = `${env.apiBaseUrl}/datalayer/${type.toLowerCase()}/${bandNumber}/${baseline}`,
          params = new HttpParams({ fromObject: {
            crs: encodeURIComponent(AppSettings.MAP_PROJECTION),
            ...(altId !== null ? { altId } : {})
            }});

    return this.http.get(url, {
      responseType: 'blob',
      observe: 'response',
      params
    });
  }
}
