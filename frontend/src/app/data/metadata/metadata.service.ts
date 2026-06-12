import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment as env } from '@src/environments/environment';
import { MetadataInterfaces } from './';
import { TranslateService } from "@ngx-translate/core";

const BASE_URL = env.apiBaseUrl;

@Injectable({
  providedIn: 'root'
})
export default class MetadataService {
  private readonly http = inject(HttpClient);
  private readonly translate = inject(TranslateService);

  getMetaData(baseline: string, activeScenarioId?: number) {
    if(activeScenarioId) {
      return this.http.get<MetadataInterfaces.APILayerData>(`${BASE_URL}/metadata/${baseline}?lang=${this.translate.currentLang}&scenarioId=${activeScenarioId}`);
    } else {
      return this.http.get<MetadataInterfaces.APILayerData>(`${BASE_URL}/metadata/${baseline}?lang=${this.translate.currentLang}`);
    }
  }
}
