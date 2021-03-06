import { EventEmitter, Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { environment as env } from '@src/environments/environment';
import { State } from '../../app-reducer';
import { MessageActions } from '@data/message';
import { MetadataSelectors } from '@data/metadata';
import { CalculationSlice, Legend, LegendType, StaticImageOptions } from './calculation.interfaces';
import { CalculationActions } from '.';
import { AppSettings } from "@src/app/app.settings";
import { register } from "ol/proj/proj4";
import proj4 from 'proj4';
import { Scenario } from "@data/scenario/scenario.interfaces";

export enum NormalizationType {
  Area = 'AREA',
  Domain = 'DOMAIN',
  UserDefined = 'USER_DEFINED',
  Percentile = 'PERCENTILE' // Only used on backend for calibration
}

export interface NormalizationOptions {
  type: NormalizationType;
  userDefinedValue?: number;
}

/** Setting this to true causes result rasters to be reprojected to the map CRS on the frontend */
const CLIENT_SIDE_REPROJECTION = false;

@Injectable({
  providedIn: 'root'
})
export class CalculationService implements OnDestroy {
  public resultReady$ = new EventEmitter<StaticImageOptions>();
  private ecoBands: number[] = [];
  private pressureBands: number[] = [];
  private bandNumbersSubscription$: Subscription;

  constructor(private http: HttpClient, private store: Store<State>) {
    if (CLIENT_SIDE_REPROJECTION) {
      proj4.defs('EPSG:3035', '+proj=laea +lat_0=52 +lon_0=10 +x_0=4321000 +y_0=3210000 +ellps=GRS80 +units=m +no_defs');
      register(proj4);
    }

    this.bandNumbersSubscription$ = this.store
      .select(MetadataSelectors.selectBandNumbers)
      .subscribe(data => {
        this.ecoBands = data.ecoComponent;
        this.pressureBands = data.pressureComponent;
      });
  }

  public calculate(scenario: Scenario) {
    const that = this;
    // TODO Consider making it a simple request (not subject to CORS)
    // TODO make NgRx effect?
    this.http.post<CalculationSlice>(env.apiBaseUrl + '/calculation/sum', scenario)
      .subscribe({
        next(response) {
          that.addResult(response.id).then(() => {
            that.store.dispatch(CalculationActions.calculationSucceeded({
              calculation: response
            }));
            // TODO hide areas
          });
        },
        error(err) {
          // FIXME set calculating to false for the correct area after areas rework
          that.store.dispatch(CalculationActions.calculationFailed());
          that.store.dispatch(
            MessageActions.addPopupMessage({
              message: {
                type: 'ERROR',
                message: `${scenario.name} could not be calculated!`,
                uuid: scenario.name
              }
            })
          );
        }
        // stop spinner in complete-callback?
      });
  }

  public getStaticImage(url:string) {
    const params = CLIENT_SIDE_REPROJECTION ?
      undefined :
      new HttpParams().set('crs', AppSettings.MAP_PROJECTION);
    return this.http.get(url, {
      responseType: 'blob',
      observe: 'response',
      params
    });
  }

  public addResult(id: string) {
    const that = this;
    return new Promise((resolve, reject) => {
      this.getStaticImage(`${env.apiBaseUrl}/calculation/${id}/image`).subscribe({
        next(response) {
          const extentHeader = response.headers.get('SYM-Image-Extent');
          if (extentHeader) {
            that.resultReady$.emit({
              url: URL.createObjectURL(response.body),
              imageExtent: JSON.parse(extentHeader),
              projection: CLIENT_SIDE_REPROJECTION ? 'EPSG:3035' : 'EPSG:3857'
            });
            resolve();
          } else {
            console.error("Result image for calculation " + id + " does not have any extent header, ignoring.");
            reject();
          }
        },
        error(err: HttpErrorResponse) {
          reject('Error fetching result image at ' +err.url);
        }
      });
    });
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

  public updateName(id: String, newName: String) {
    return this.http.post<CalculationSlice>(`${env.apiBaseUrl}/calculation/${id}`,
      newName,
      {
        headers: new HttpHeaders({ 'Content-Type': 'text/plain' }),
        params: new HttpParams({ fromObject: { action: "update-name"}})});
  }

  public getLegend(type: LegendType|'comparison') {
    return this.http.get<Legend>(`${env.apiBaseUrl}/legend/${type}`);
  }

  ngOnDestroy() {
    if (this.bandNumbersSubscription$) {
      this.bandNumbersSubscription$.unsubscribe();
    }
  }
}
