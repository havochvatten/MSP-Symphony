import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment as env } from '@src/environments/environment';
import {
  Scenario,
  ScenarioArea,
  ScenarioCopyOptions,
  ScenarioMatrixDataMap,
  ScenarioSplitOptions, ScenarioSplitResponse
} from "@data/scenario/scenario.interfaces";
import { Baseline } from "@data/user/user.interfaces";
import { NormalizationOptions } from "@data/calculation/calculation.service";
import { GeoJSONFeature } from 'ol/format/GeoJSON';
import { ScenarioLayer } from "@src/app/map-view/map/layers/scenario-layer";
import { Area } from "@data/area/area.interfaces";
import { AreaMatrixData } from "@src/app/map-view/scenario/scenario-area-detail/matrix-selection/matrix.interfaces";

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

  convertAreas(areas: Area[]): ScenarioArea[] {
    return areas.map(area => ({
      id: -1,
      feature: area.feature,
      changes: null,
      excludedCoastal: -1, // "magic" number to prevent inclusion by default
      matrix: { matrixType: 'STANDARD', matrixId: undefined },
      scenarioId: -1,
      customCalcAreaId: null
      })) as ScenarioArea[]
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

  delete(ids: number[]) {
    return this.http.delete(`${this.scenarioApiBaseUrl}?ids=${ids.join()}`);
  }

  copy(scenarioId: number, options: ScenarioCopyOptions) {
    return this.http.post<Scenario>(this.scenarioApiBaseUrl+'/'+scenarioId+'/copy', options);
  }

  setScenarioChangeVisibility(feature: GeoJSONFeature) {
    return this.scenarioLayer!.toggleChangeAreaVisibility(feature);
  }

  getAreaMatrixParams(scenarioId: number, baseline: string) {
    return this.http.get<{ matrixData: ScenarioMatrixDataMap }>(env.apiBaseUrl+ '/calculationparams/areamatrices/'+baseline+'/'+scenarioId);
  }

  getSingleAreaMatrixParams(scenarioAreaId: number, baseline: string) {
    return this.http.get<AreaMatrixData>(env.apiBaseUrl+ '/calculationparams/areamatrix/'+baseline+'/'+scenarioAreaId);
  }

  deleteArea(areaId: number) {
    return this.http.delete(this.scenarioApiBaseUrl+'/area/'+areaId);
  }

  addScenarioAreas(scenarioId: number, areas: ScenarioArea[]) {
    return this.http.post<ScenarioArea[]>(this.scenarioApiBaseUrl + '/' + scenarioId + '/areas' , areas);
  }

  transferChanges(targetId:number, scenarioId: number, overwrite: boolean) {
    return this.http.post<Scenario>(this.scenarioApiBaseUrl + '/' + targetId + '/transferChanges', {
      Id: scenarioId,
      overwrite
    });
  }

  transferAreaChanges(targetId: number, areaId: number, overwrite: boolean) {
    return this.http.post<Scenario>(this.scenarioApiBaseUrl + '/' + targetId + '/transferAreaChanges', {
      Id: areaId,
      overwrite
    });
  }

  transferChangesToArea(targetId:number, scenarioId: number, overwrite: boolean) {
    return this.http.post<Scenario>(this.scenarioApiBaseUrl + '/area/' + targetId + '/transferChanges', {
      Id: scenarioId,
      overwrite
    });
  }

  transferAreaChangesToArea(targetId: number, areaId: number, overwrite: boolean) {
    return this.http.post<Scenario>(this.scenarioApiBaseUrl + '/area/' + targetId + '/transferAreaChanges', {
      Id: areaId,
      overwrite
    });
  }

  splitScenarioForBatch(scenarioId: number, options: ScenarioSplitOptions) {
    return this.http.post<ScenarioSplitResponse>(this.scenarioApiBaseUrl + '/' + scenarioId + '/split', options);
  }

  splitAndReplaceScenarioArea(scenarioId: number, replacedAreaId: number, replacementAreas: ScenarioArea[]) {
    return this.http.post<Scenario>(this.scenarioApiBaseUrl + '/' + scenarioId + '/splitAndReplaceArea/' + replacedAreaId, replacementAreas);
  }
}
