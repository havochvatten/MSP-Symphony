import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatLatestFrom } from '@ngrx/operators';
import {
  catchError,
  concatMap,
  debounceTime,
  map,
  mergeMap,
  skipWhile,
  switchMap
} from 'rxjs/operators';
import { forkJoin, Observable, of } from 'rxjs';
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
import { UserSelectors } from '@data/user';
import { CalculationActions } from '@data/calculation';
import { ModelDescriptionDialogData } from '@src/app/map-view/band-selection/summary-model-selection/summary-model-dialog/summary-model-dialog.component';
import { DataLayerService } from '@src/app/map-view/map/layers/data-layer.service';

@Injectable()
export class MetadataEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject<Store<State>>(Store);
  private readonly metadataService = inject(MetadataService);
  private readonly dataLayerService = inject(DataLayerService);

  fetchMetadata$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MetadataActions.fetchMetadata, MetadataActions.fetchMetadataForBaseline),
      concatMap((action) =>
        of(action).pipe(
          concatLatestFrom(() => [
            this.store.select(UserSelectors.selectBaseline),
            this.store.select(ScenarioSelectors.selectActiveScenario)
          ])
        )
      ),
      skipWhile(([, activeBaseline]) => !activeBaseline),
      mergeMap(([action, activeBaseline, scenario]) => {
        const baselineName =
          action.type === MetadataActions.fetchMetadata.type
            ? activeBaseline!.name
            : action.baselineName;
        return (
          !scenario
            ? this.metadataService.getMetaData(baselineName)
            : this.metadataService.getMetaData(baselineName, scenario!.id)
        ).pipe(
          map((layerData) => {
            const newLayerData = {
              ...layerData,
              ecoComponent: this.formatComponentData(layerData, 'ecoComponent'),
              pressureComponent: this.formatComponentData(layerData, 'pressureComponent')
            };
            return !scenario
              ? MetadataActions.fetchMetadataSuccess({ metadata: newLayerData })
              : MetadataActions.fetchSparseMetadataSuccess({ metadata: newLayerData });
          }),
          catchError((error) =>
            of(
              MetadataActions.fetchMetadataFailure({
                error: {
                  status: error.status,
                  message: error.error
                }
              })
            )
          )
        );
      })
    )
  );

  updateMultiplierMapState$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MetadataActions.updateMultiplier),
      debounceTime(200),
      concatMap((action) =>
        of(action).pipe(
          concatLatestFrom(() => this.store.select(MetadataSelectors.selectMetadataState))
        )
      ),
      switchMap(([{ band, value }, metadata]) => {
        return of(
          ScenarioActions.updateBandAttribute({
            componentType: band.symphonyCategory,
            band: band.bandNumber,
            attribute: 'multiplier',
            value: value
          })
        ).pipe();
      })
    )
  );

  fetchSummaryModelDescriptions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CalculationActions.fetchSummaryModelsSuccess),
      mergeMap(({ baselineName, category, models }) =>
        forkJoin(
          models.reduce(
            (acc, model) => ({
              ...acc,
              [model.key]: this.dataLayerService.getSummaryModelDescription(
                baselineName,
                category,
                model.key
              )
            }),
            {} as { [model: string]: Observable<ModelDescriptionDialogData> }
          )
        ).pipe(
          map((descriptions) =>
            MetadataActions.fetchSummaryModelDescriptionsSuccess({ category, descriptions })
          ),
          catchError((err) =>
            of(
              MetadataActions.fetchSummaryModelDescriptionsFailure({
                category,
                error: err.message
              })
            )
          )
        )
      )
    )
  );

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
