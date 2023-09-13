import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, map, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';

import AreaService from './area.service';
import { AreaActions } from './';
import { Area, Areas, Feature, NationalArea, NationalAreaState, Polygon, StatePath } from './area.interfaces';
import { ServerError } from "../message/message.interfaces";
import { TranslateService } from '@ngx-translate/core';
import { Store } from "@ngrx/store";
import { State } from "@src/app/app-reducer";

@Injectable()
export class AreaEffects {
  constructor(
    private actions$: Actions,
    private store$: Store<State>,
    private areaService: AreaService,
    private translateService: TranslateService
  ) {
  }

  fetchNationalAreas$ = createEffect(() => this.actions$.pipe(
    ofType(AreaActions.fetchNationalAreas),
    mergeMap(() =>
      this.areaService.getNationalAreaTypes().pipe(
        map(
          (areaTypes: string[]) => [
            AreaActions.fetchNationalAreaTypesSuccess({ areaTypes }),
            ...areaTypes.map(areaType => AreaActions.fetchNationalArea({ areaType }))
          ],
          catchError(({ status, error: message }) =>
            of(AreaActions.fetchNationalAreaTypesFailure({ error: { status, message } }))
          )
        ),
        concatMap(actions => actions)
      )
    )
  ));

  fetchNationalArea$ = createEffect(() => this.actions$.pipe(
    ofType(AreaActions.fetchNationalArea),
    mergeMap(({ areaType }) =>
      this.areaService.getNationalAreasData(areaType).pipe(
        map(area => {
          const language = this.translateService.currentLang;
          const nationalArea = {
            [area.type]: flattenAreaGroups(area, language)
          };
          return AreaActions.fetchNationalAreaSuccess({ nationalArea });
        })
      )
    )
  ));

  fetchUserDefinedArea$ = createEffect(() => this.actions$.pipe(
    ofType(AreaActions.fetchUserDefinedAreas),
    mergeMap(() =>
      this.areaService.getUserAreas().pipe(
        map(userAreas =>
          AreaActions.fetchUserDefinedAreasSuccess({
            userAreas: userAreas.reduce(
              (userAreaState, userArea) => ({
                ...userAreaState,
                [userArea.id as number]: {
                  ...userArea,
                  displayName: userArea.name,
                  statePath: ['userArea', userArea.id],
                  feature: createFeature(
                    userArea.name,
                    userArea.name,
                    userArea.name,
                    ['userArea', userArea.id as number],
                    userArea.polygon
                  )
                }
              }),
              {}
            )
          })
        ),
        catchError(({ status, error: message }) =>
          of(AreaActions.fetchUserDefinedAreasFailure({ error: { status, message } }))
        )
      )
    )
  ));

  createUserDefinedArea$ = createEffect(() => this.actions$.pipe(
    ofType(AreaActions.createUserDefinedArea),
    mergeMap(({ name, description, polygon }) =>
      this.areaService.createUserArea({ name, description, polygon }).pipe(
        map(userAreaResponse =>
          AreaActions.createUserDefinedAreaSuccess({
            userArea: {
              ...userAreaResponse,
              visible: true,
              displayName: userAreaResponse.name,
              statePath: ['userArea', userAreaResponse.id as number],
              feature: createFeature(
                userAreaResponse.name,
                userAreaResponse.name,
                userAreaResponse.name,
                ['userArea', userAreaResponse.id as number],
                userAreaResponse.polygon
              )
            }
          })
        ),
        catchError(({ status, error: message }) => {
            const srvError = (message as ServerError), translateKey = 'map.user-area.create.error.' + srvError.errorCode,
                  tmpMessage = this.translateService.instant(translateKey,
                    { areaName: name });
            if(tmpMessage !== translateKey) {
              (message as ServerError).errorMessage = tmpMessage;
            }
            return of(AreaActions.createUserDefinedAreaFailure({error: { status, message }}))
          }
        )
      )
    )
  ));

  updateUserDefinedArea$ = createEffect(() => this.actions$.pipe(
    ofType(AreaActions.updateUserDefinedArea),
    mergeMap(({ id, name, description, polygon }) =>
      this.areaService.updateUserArea({ id, name, description, polygon }).pipe(
        map(userAreaResponse =>
          AreaActions.updateUserDefinedAreaSuccess({
            userArea: {
              ...userAreaResponse,
              visible: true,
              displayName: userAreaResponse.name,
              statePath: ['userArea', userAreaResponse.id as number],
              feature: createFeature(
                userAreaResponse.name,
                userAreaResponse.name,
                userAreaResponse.name,
                ['userArea', userAreaResponse.id as number],
                userAreaResponse.polygon
              )
            }
          })
        ),
        catchError(({ status, error: message }) =>
          of(AreaActions.updateUserDefinedAreaFailure({ error: { status, message } }))
        )
      )
    )
  ));

  deleteUserDefinedArea$ = createEffect(() => this.actions$.pipe(
    ofType(AreaActions.deleteUserDefinedArea),
    mergeMap(({ userAreaId }) =>
      this.areaService.deleteUserArea(userAreaId).pipe(
        map(() => AreaActions.deleteUserDefinedAreaSuccess({ userAreaId })),
        catchError(({ status, error: message }) =>
          of(AreaActions.deleteUserDefinedAreaFailure({ error: { status, message } }))
        )
      )
    )
  ));

  fetchBoundaries$ = createEffect(() => this.actions$.pipe(
    ofType(AreaActions.fetchBoundaries),
    mergeMap(() =>
      this.areaService
        .getBoundaries()
        .pipe(
          map(
            ({areas: boundaries}) => AreaActions.fetchBoundariesSuccess({boundaries})),
          catchError(({status, error: message}) =>
            of(AreaActions.fetchBoundariesFailure({error: {status, message}}))
          )
        )
    )
  ));

  // @Effect()
  // uploadPolygons$ = this.actions$.pipe(
  //   ofType(AreaActions.uploadUserDefinedArea),
  //   mergeMap(({ formdata }) =>
  //     this.areaService.uploadUserArea(formdata).pipe(
  //       map(uploadResponse => d),
  //       catchError(({ status, error: message }) =>
  //     of(AreaActions.fetchBoundariesFailure({ error: { status, message } }))
  //     )
  //
  //             )
  //         )
  // );
}

function flattenAreaGroups(nationalArea: NationalArea, language: string): NationalAreaState {
  return {
    ...nationalArea,
    displayName: nationalArea[language] as string ?? nationalArea['en'],
    groups: nationalArea.groups.reduce(
      (groupMap, group) => ({
        ...groupMap,
        [group.en]: {
          ...group,
          name: group[language] ?? group.en,
          visible: group.en === 'Areas',
          statePath: ['area', nationalArea.type, 'groups', group.en],
          areas: flattenAreas(group.areas, ['area', nationalArea.type, 'groups', group.en])
        }
      }),
      {}
    )
  };
}

function flattenAreas(areas: Area[], parentPath: StatePath): Areas {
  return areas.reduce((prevAreas, area) => {
    const statePath = [...parentPath, 'areas', area.name];
    const displayName = area.name + (typeof area.code === 'string' ? ` (${area.code})` : '');
    return {
      ...prevAreas,
      [area.name]: {
        ...area,
        displayName,
        statePath,
        feature: createFeature(
          area.name,
          area.name,
          displayName,
          statePath,
          area.polygon,
          area.code
        )
      }
    };
  }, {});
}

export function createFeature(
  name: string,
  id: string | number,
  displayName: string,
  statePath: StatePath,
  geometry: Polygon,
  code?: string
): Feature {
  return {
    type: 'Feature',
    properties: {
      name,
      id,
      displayName,
      statePath,
      code
    },
    geometry
  };
}
