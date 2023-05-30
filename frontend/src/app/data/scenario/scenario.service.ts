import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment as env } from '@src/environments/environment';
import { Scenario, ScenarioArea, ScenarioMatrixDataMap } from "@data/scenario/scenario.interfaces";
import { Baseline } from "@data/user/user.interfaces";
import { NormalizationOptions } from "@data/calculation/calculation.service";
import { GeoJSONFeature } from 'ol/format/GeoJSON';
import { ScenarioLayer } from "@src/app/map-view/map/layers/scenario-layer";

@Injectable({
  providedIn: 'root'
})
export class ScenarioService {
  private scenarioLayer?: ScenarioLayer;
  private scenarioApiBaseUrl = `${env.apiBaseUrl}/scenario`;

  constructor(private http: HttpClient) {}

  // The below is not so nice, would be nicer if we could inject this or something
  setScenarioLayer(layer: ScenarioLayer) {
    this.scenarioLayer = layer;
  }

  getUserScenarios() {
    return this.http.get<Scenario[]>(this.scenarioApiBaseUrl);
  }

  create(baseline: Baseline, name: string, areas: ScenarioArea[], normalization: NormalizationOptions,
         ecosystemsToInclude: number[], pressuresToInclude: number[]) {

    return this.http.post<Scenario>(this.scenarioApiBaseUrl, {
      baselineId: baseline.id,
      name,
      areas,
      changes: null,
      normalization,
      ecosystemsToInclude,
      pressuresToInclude
    });
  }

  save(scenarioToBeSaved: Scenario) {
    return this.http.put<Scenario>(this.scenarioApiBaseUrl, scenarioToBeSaved);
  }

  delete(id: number) {
    return this.http.delete(this.scenarioApiBaseUrl+'/'+id);
  }

  setScenarioChangeVisibility(feature: GeoJSONFeature) {
    return this.scenarioLayer!.toggleChangeAreaVisibility(feature);
  }

  hideScenarioChanges() {
    this.scenarioLayer?.hideChangeAreas();
  }

  getAreaMatrixParams(scenarioId: number, baseline: string) {
    return this.http.post<ScenarioMatrixDataMap>(env.apiBaseUrl+ '/calculationparams/areamatrices/'+baseline, scenarioId);
  }

  deleteArea(areaId: any) {
    return this.http.delete(this.scenarioApiBaseUrl+'/area/'+areaId);
  }
}
