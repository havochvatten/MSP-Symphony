import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, debounceTime, map, mergeMap, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import MetadataService from './metadata.service';
import { MetadataActions, MetadataSelectors } from './';
import {
  APILayerData,
  Band,
  BandGroup,
  ComponentKey,
  Components,
  Groups
} from './metadata.interfaces';
import { Store } from '@ngrx/store';
import { State } from '@src/app/app-reducer';
import { ScenarioActions, ScenarioSelectors } from '@data/scenario';
import { UserSelectors } from "@data/user";

@Injectable()
export class MetadataEffects {
  constructor(
    private actions$: Actions,
    private store: Store<State>,
    private metadataService: MetadataService
  ) {}

  fetchMetadata$ = createEffect(() => this.actions$.pipe(
    ofType(MetadataActions.fetchMetadata, MetadataActions.fetchMetadataForBaseline),
    concatMap(action =>
      of(action).pipe(
        concatLatestFrom(() =>
          [ this.store.select(UserSelectors.selectBaseline),
            this.store.select(ScenarioSelectors.selectActiveScenario) ]
        )
      ),
    ),
    mergeMap(([action, activeBaseline, scenario]) => {
      const baselineName =
        action.type === MetadataActions.fetchMetadata.type ?
          activeBaseline!.name : action.baselineName;
      return (!scenario ?
        this.metadataService.getMetaData(baselineName) :
        this.metadataService.getMetaData(baselineName, scenario!.id)).pipe(
        map(layerData => {
          const newLayerData = {
            ...layerData,
            ecoComponent: this.formatComponentData(layerData, 'ecoComponent'),
            pressureComponent: this.formatComponentData(layerData,'pressureComponent')
          };
          return MetadataActions.fetchMetadataSuccess({metadata: newLayerData});
        }),
        catchError(error =>
          of(
            MetadataActions.fetchMetadataFailure({
              error: {
                status: error.status,
                message: error.error
              }
            })
          )
        ))
    })
  ));

  updateMultiplierMapState$ = createEffect(() => this.actions$.pipe(
    ofType(MetadataActions.updateMultiplier),
    debounceTime(200),
    concatMap(action =>
      of(action).pipe(
        concatLatestFrom(() => this.store.select(MetadataSelectors.selectMetadataState))
      )
    ),
    switchMap(([{ band, value }, metadata]) => {
      return of(ScenarioActions.updateBandAttribute({
        componentType: band.symphonyCategory,
        band: band.bandNumber,
        attribute: 'multiplier',
        value: value
      })).pipe();
    })
  ));

  private formatComponentData(layerData: APILayerData, componentType: ComponentKey): Groups {
    return layerData[componentType].symphonyThemes.reduce((themes: Groups, theme: BandGroup) => {
      themes[theme.symphonyThemeName] = {
        ...theme,
        bands: theme.bands
          .map((property: Band) => ({
            ...property,
            displayName: property.title
          }))
          .reduce((properties: Components, property: Band) => {
            properties[property.bandNumber] = property;
            return properties;
          }, {})
      };
      return themes;
    }, {});
  }
}
