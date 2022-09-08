import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { catchError, concatMap, debounceTime, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';
import MetadataService from './metadata.service';
import { MetadataActions, MetadataSelectors } from './';
import { APILayerData, Band, BandGroup, ComponentKey, Components, Groups } from './metadata.interfaces';
import { Store } from '@ngrx/store';
import { State } from '@src/app/app-reducer';
import { getIn } from "immutable";
import { ScenarioActions } from "@data/scenario";
import { getComponentType } from "@data/metadata/metadata.selectors";
import { findBestLanguageMatch } from "@src/app/app-translation-setup.module";

@Injectable()
export class MetadataEffects {
  constructor(
    private actions$: Actions,
    private store: Store<State>,
    private metadataService: MetadataService,
  ) {}

  @Effect()
  fetchMetadata$ = this.actions$.pipe(
    ofType(MetadataActions.fetchMetadata),
    mergeMap(({baseline}) =>
      this.metadataService.getMetaData(baseline).pipe(
        map(layerData => {
          const newLayerData = {
            ...layerData,
            ecoComponent: this.formatComponentData(layerData, 'ecoComponent'),
            pressureComponent: this.formatComponentData(layerData, 'pressureComponent'/*, language*/)
          };
          return MetadataActions.fetchMetadataSuccess({ metadata: newLayerData });
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
        )
      )
    )
  );

  @Effect()
  updateMultiplierMapState$ = this.actions$.pipe(
    ofType(MetadataActions.updateMultiplier),
    debounceTime(200),
    concatMap(action => of(action).pipe(
      withLatestFrom(this.store.select(MetadataSelectors.selectMetadataState)), // for NgRx 11+, use concatLatestFrom
    )),
    map(([{ area, bandPath, value }, metadata]) =>
      // Here we could fetch the state from the actual map feature using a Promise or such
      ScenarioActions.updateBandAttribute({
        area, // FIXME make sure we can only change when selected
        componentType: getComponentType(bandPath),
        bandId: bandPath[bandPath.length-1] as string,
        band: getIn(metadata, [...bandPath, 'bandNumber'], NaN),
        attribute: 'multiplier',
        value,
      }))
  );

  private formatComponentData(
    layerData: APILayerData,
    componentType: ComponentKey,
  ): Groups {
    const useMetadataLocalLang = findBestLanguageMatch([layerData.language]);
    return layerData[componentType].symphonyTeams.reduce((teams: Groups, team: BandGroup) => {
      teams[team.symphonyTeamName] = {
        ...team,
        displayName: useMetadataLocalLang ? team.symphonyTeamNameLocal : team.symphonyTeamName,
        properties: team.properties
          .map((property: Band) => ({
            ...property,
            displayName: useMetadataLocalLang ? property.titleLocal : property.title,
            selected: property.defaultSelected,
            statePath: [componentType, team.symphonyTeamName, 'properties', property.title]
          }))
          .reduce((properties: Components, property: Band) => {
            properties[property.title] = property;
            return properties;
          }, {})
      };
      return teams;
    }, {});
  }
}
