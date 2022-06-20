import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { catchError, concatMap, debounceTime, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';
import MetadataService from './metadata.service';
import { MetadataActions, MetadataSelectors } from './';
import { APILayerData, Band, BandGroup, ComponentKey, Components, Groups, StatePath } from './metadata.interfaces';
import { Store } from '@ngrx/store';
import { State } from '@src/app/app-reducer';
import { TranslateService } from '@ngx-translate/core';
import { getIn } from "immutable";
import { ScenarioActions } from "@data/scenario";
import { getComponentType } from "@data/metadata/metadata.selectors";

type Language = 'sv' | 'en';

@Injectable()
export class MetadataEffects {
  constructor(
    private actions$: Actions,
    private store: Store<State>,
    private metadataService: MetadataService,
    private translateService: TranslateService
  ) {}

  @Effect()
  fetchMetadata$ = this.actions$.pipe(
    ofType(MetadataActions.fetchMetadata),
    mergeMap(({baseline}) =>
      this.metadataService.getMetaData(baseline).pipe(
        map(layerData => {
          const language = this.translateService.currentLang as Language;
          const newLayerData = {
            ...layerData,
            ecoComponent: formatComponentData(layerData, 'ecoComponent', language),
            pressureComponent: formatComponentData(layerData, 'pressureComponent', language)
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
}

function formatComponentData(
  layerData: APILayerData,
  componentType: ComponentKey,
  language: Language
): Groups {
  return layerData[componentType].symphonyTeams.reduce((teams: Groups, team: BandGroup) => {
    teams[team.symphonyTeamName] = {
      ...team,
      displayName: language === 'sv' ? team.symphonyTeamNameLocal : team.symphonyTeamName,
      properties: team.properties
        .map((property: Band) => ({
          ...property,
          displayName: language === 'sv' ? property.titleLocal : property.title,
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
