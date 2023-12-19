import { EventEmitter, Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { environment as env } from '@src/environments/environment';
import { State } from '@src/app/app-reducer';
import { MessageActions } from '@data/message';
import { MetadataSelectors } from '@data/metadata';
import {
  CalculationSlice,
  Legend,
  LegendType,
  PercentileResponse,
  BatchCalculationProcessEntry,
  StaticImageOptions
} from './calculation.interfaces';
import { CalculationActions } from '.';
import { AppSettings } from '@src/app/app.settings';
import { register } from 'ol/proj/proj4';
import proj4 from 'proj4';
import { Scenario } from '@data/scenario/scenario.interfaces';
import { UserSelectors } from "@data/user";
import { transformExtent } from "ol/proj";

export enum NormalizationType {
  Area = 'AREA',
  Domain = 'DOMAIN',
  UserDefined = 'USER_DEFINED',
  StandardDeviation = 'STANDARD_DEVIATION',
  Percentile = 'PERCENTILE' // Only used on backend for calibration
}

export enum CalcOperation {
  Cumulative, RarityAdjusted,
}

export interface NormalizationOptions {
  type: NormalizationType;
  userDefinedValue?: number;
  stdDevMultiplier?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CalculationService implements OnDestroy {
  public resultReady$ = new EventEmitter<StaticImageOptions>();
  public resultRemoved$ = new EventEmitter<number>();
  private ecoBands: number[] = [];
  private pressureBands: number[] = [];
  private bandNumbersSubscription$: Subscription;
  private aliasingSubscription$: Subscription;
  private aliasing: boolean = true;

  constructor(private http: HttpClient, private store: Store<State>) {
    proj4.defs('EPSG:3035', '+proj=laea +lat_0=52 +lon_0=10 +x_0=4321000 +y_0=3210000 +ellps=GRS80 +units=m +no_defs');
    proj4.defs('ESRI:54034', '+proj=cea +lat_ts=-12 +lon_0=12 +x_0=0 +y_0=0 +datum=WGS84 +units=m' +
      ' +no_defs');
    register(proj4);

    this.bandNumbersSubscription$ = this.store
      .select(MetadataSelectors.selectBandNumbers)
      .subscribe(data => {
        this.ecoBands = data.ecoComponent;
        this.pressureBands = data.pressureComponent;
      });

    this.aliasingSubscription$ = this.store.select(UserSelectors.selectAliasing).subscribe((aliasing: boolean) => {
      this.aliasing = aliasing;
    });
  }

  public calculate(scenario: Scenario) {
    const that = this;
    // TODO Consider making it a simple request (not subject to CORS)
    // TODO make NgRx effect?

    this.http.post<CalculationSlice>(env.apiBaseUrl+'/calculation/sum', scenario.id).
    subscribe({
      next(response) {
        that.addResult(response.id).then(() => {
          that.store.dispatch(CalculationActions.calculationSucceeded({
            calculation: response
          }));
        });
      },
      error(err) {
        that.store.dispatch(CalculationActions.calculationFailed());
        that.store.dispatch(
          MessageActions.addPopupMessage({
            message: {
              type: 'ERROR',
              message: `${scenario.name} could not be calculated!`,
              uuid: scenario.id + '_' + scenario.name
            }
          })
        );
      }
      // stop spinner in complete-callback?
    });
  }

  public getStaticImage(url:string) {
    const params = AppSettings.CLIENT_SIDE_PROJECTION ?
      undefined :
      new HttpParams().set('crs', encodeURIComponent(AppSettings.MAP_PROJECTION));
    return this.http.get(url, {
      responseType: 'blob',
      observe: 'response',
      params
    });
  }

  public addComparisonResult(idA: string, idB: string, dynamic: boolean, max: number){
    //  Bit "hacky" but workable "faux" id constructed as a negative number
    //  to guarantee uniqueness without demanding a separate interface.
    //  Note that this artficially imposes a virtual maximum for calculation
    //  result ids to 2^26 - 1 (around 67 million).
    //  The limit is chosen specifically in relation to Number.MIN_SAFE_INTEGER
    //  which is -2^53

    return this.addResultImage(this.cmpId(+idA, +idB), `diff/${idA}/${idB}`
                                                  + (dynamic ? '?dynamic=true' : '?max=' + max));
  }

  cmpId(a:number, b:number): number {
    return (a * Math.pow(2, 26) + (b & 0x3ffffff)) * -1;
  }

  public addResult(id: number){
    return this.addResultImage(id, `${id}/image`);
  }

  private addResultImage(id: number, epFragment: string) {
    const that = this;
    return new Promise<number | null>((resolve, reject) => {
      this.getStaticImage(`${env.apiBaseUrl}/calculation/` + epFragment).subscribe({
        next(response) {
          const extentHeader = response.headers.get('SYM-Image-Extent'),
                dynamicMaxHeader = response.headers.get('SYM-Dynamic-Max');
          if (extentHeader) {
            that.resultReady$.emit({
              url: URL.createObjectURL(response.body!),
              calculationId: id,
              imageExtent: JSON.parse(extentHeader),
              projection: AppSettings.CLIENT_SIDE_PROJECTION ?
                            AppSettings.DATALAYER_RASTER_CRS :
                            AppSettings.MAP_PROJECTION,
              interpolate: that.aliasing
            });
            resolve(dynamicMaxHeader ? +dynamicMaxHeader : null);
          } else {
            console.error(
              'Result image for calculation ' + id + ' does not have any extent header, ignoring.'
            );
            reject();
          }
        },
        error(err: HttpErrorResponse) {
          that.store.dispatch(CalculationActions.calculationFailed());
          reject('Error fetching result image at ' +err.url);
        }
      });
    });
  }

  public deleteResults(ids: number[]){
    const that = this;
    return new Promise<void>((resolve, reject) => {
        that.delete(ids).subscribe({
          next(response) {
            ids.forEach((id) => {
              that.resultRemoved$.emit(id);
            });
            resolve();
          },
          error(err: HttpErrorResponse) {
            reject('Server error');
          }});
      });
  }

  public removeResultPixels(id: number) {
    this.resultRemoved$.emit(id);
  }

  public getBaselineCalculations(id: string) {
    return this.http.get<CalculationSlice[]>(`${env.apiBaseUrl}/calculation/baseline/${id}`);
  }

  public getAll() {
    return this.http.get<CalculationSlice[]>(`${env.apiBaseUrl}/calculation/all`);
  }

  public getMatchingCalculations(id: string) {
    return this.http.get<CalculationSlice[]>(`${env.apiBaseUrl}/calculation/matching/${id}`);
  }

  public updateName(id: number, newName: String) {
    return this.http.post<CalculationSlice>(`${env.apiBaseUrl}/calculation/${id}`,
      newName,
      {
        headers: new HttpHeaders({ 'Content-Type': 'text/plain' }),
        params: new HttpParams({ fromObject: { action: "update-name"}})});
  }

  public getLegend(type: LegendType) {
    return this.http.get<Legend>(`${env.apiBaseUrl}/legend/${type}`);
  }

  public getComparisonLegend(maxValue: number) {
    return this.http.get<Legend>(`${env.apiBaseUrl}/legend/comparison?maxValue=${maxValue}`);
  }

  public getPercentileValue() {
    return this.http.get<PercentileResponse>(`${env.apiBaseUrl}/calibration/percentile-value`);
  }

  public queueBatchCalculation(scenarioIds: number[]) {
    return this.http.post<BatchCalculationProcessEntry>(`${env.apiBaseUrl}/calculation/batch`, scenarioIds.join(), {
      headers: new HttpHeaders({ 'Content-Type': 'text/plain' })});
  }

  delete(ids: number[]) {
    return this.http.delete(`${env.apiBaseUrl}/calculation?ids=${ids.join()}`);
  }

  ngOnDestroy() {
    if (this.bandNumbersSubscription$) {
      this.bandNumbersSubscription$.unsubscribe();
    }
    if (this.aliasingSubscription$) {
      this.aliasingSubscription$.unsubscribe();
    }
  }

  removeFinishedBatchProcess(id: number) {
    return this.http.delete(`${env.apiBaseUrl}/calculation/batch/${id}`);
  }

  cancelBatchProcess(id: number) {
    return this.http.post(`${env.apiBaseUrl}/calculation/batch/${id}/cancel`, null);
  }
}
