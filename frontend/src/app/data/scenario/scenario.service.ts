import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment as env } from '@src/environments/environment';
import { Scenario } from "@data/scenario/scenario.interfaces";
import { Baseline } from "@data/user/user.interfaces";
import { NormalizationOptions } from "@data/calculation/calculation.service";
import { Feature } from "@data/area/area.interfaces";
import GeoJSON, { GeoJSONFeature, GeoJSONGeometry } from 'ol/format/GeoJSON';
import { ScenarioLayer } from "@src/app/map-view/map/layers/scenario-layer";
import { AreaMatrixData } from "@src/app/map-view/scenario/scenario-detail/matrix-selection/matrix.interfaces";

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

  create(baseline: Baseline, name: string, feature: Feature, normalization: NormalizationOptions,
         ecosystemsToInclude: number[], pressuresToInclude: number[]) {
    const geoJson = new GeoJSON();

    return this.http.post<Scenario>(this.scenarioApiBaseUrl, {
      baselineId: baseline.id,
      name,
      feature,
      changes: geoJson.writeFeaturesObject([]), // empty collection
      normalization,
      ecosystemsToInclude,
      pressuresToInclude
    });
  }

  save(scenarioToBeSaved: Scenario) {
    return this.http.put<Scenario>(this.scenarioApiBaseUrl, scenarioToBeSaved);
  }

  delete(id: string) {
    return this.http.delete(this.scenarioApiBaseUrl+'/'+id);
  }

  removeScenarioChangeFeature(id: string|number) {
    this.scenarioLayer!.removeScenarioChangeFeature(id);
  }

  setScenarioChangeVisibility(feature: GeoJSONFeature) {
    return this.scenarioLayer!.toggleChangeAreaVisibility(feature);
  }

  hideScenarioChanges() {
    this.scenarioLayer?.hideChangeAreas();
  }

  getAreaMatrixParams(geometry: GeoJSONGeometry, baseline: string) {
    return this.http.post<AreaMatrixData>(env.apiBaseUrl+ '/calculationparams/areamatrices/'+baseline, geometry);
  }
}
