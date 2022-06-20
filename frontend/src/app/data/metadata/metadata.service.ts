import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment as env } from '@src/environments/environment';
import { MetadataInterfaces } from './';
import { Band, BandGroup } from "@data/metadata/metadata.interfaces";

const BASE_URL = env.apiBaseUrl;

@Injectable({
  providedIn: 'root'
})
export default class MetadataService {
  constructor(private http: HttpClient) {}

  getMetaData(baseline: string) {
    return this.http.get<MetadataInterfaces.APILayerData>(`${BASE_URL}/metadata/${baseline}`);
  }

  flattenBandGroups(bandGroups: BandGroup[] = []): Record<number, string> {
    const bands = bandGroups.reduce(
      (bandList: Band[], bandGroup: BandGroup) => [...bandList, ...bandGroup.properties],
      []
    );
    return bands.reduce(
      (bandMap: Record<number, string>, band: Band) => ({
        ...bandMap,
        [band.bandNumber]: band.displayName
      }),
      {}
    );
  }
}
