import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { BandType, BandType_Alt, HeatmapModel, bandTypesMap } from '@data/metadata/metadata.interfaces';
import { MetadataActions, MetadataSelectors } from '@data/metadata';
import { Store } from '@ngrx/store';
import { State } from '@src/app/app-reducer';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-summary-model-selection',
  templateUrl: './summary-model-selection.component.html',
  styleUrls: ['./summary-model-selection.component.scss'],
  standalone: false
})
export class SummaryModelSelectionComponent implements OnInit, OnDestroy {
  private store = inject<Store<State>>(Store);
  private cdr = inject(ChangeDetectorRef);

  readonly heatmapModelRows: ReadonlyArray<{
    model: Exclude<HeatmapModel, 'none'>;
    labelKey: string;
  }> = [
    {
      model: 'simple',
      labelKey: 'map.summary-model.simple'
    },
    {
      model: 'balanced',
      labelKey: 'map.summary-model.balanced'
    }
  ];

  @Input() bandTypesCategory: BandType_Alt = 'ecoComponents';
  @Input() scenarioActive = false;
  heatmapModel$?: Observable<HeatmapModel>;
  currentHeatmapModel: HeatmapModel = 'none';
  heatmapLoading = false;
  private heatmapModelSubscription?: Subscription;
  private heatmapLoadingSubscription?: Subscription;

  ngOnInit() {
    const bandTypeCategoriesKey = bandTypesMap.get(this.bandTypesCategory) as BandType;

    this.heatmapModel$ = this.store.select(MetadataSelectors.selectVisibleHeatmaps).pipe(
      map(models => models[bandTypeCategoriesKey])
    );

    this.heatmapModelSubscription = this.heatmapModel$.subscribe((model) => {
      this.currentHeatmapModel = model;
    });

    this.heatmapLoadingSubscription = this.store
      .select(MetadataSelectors.selectHeatmapLoading(bandTypeCategoriesKey))
      .subscribe(loading => {
        this.heatmapLoading = loading;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy() {
    this.heatmapModelSubscription?.unsubscribe();
    this.heatmapLoadingSubscription?.unsubscribe();
  }

  onHeatmapModelChange(model: string) {
    this.store.dispatch(MetadataActions.setHeatmapModel({
      bandType: bandTypesMap.get(this.bandTypesCategory) as BandType,
      model: model as HeatmapModel
    }));
  }

  isHeatmapModelSelected = (model: HeatmapModel): boolean => {
    return this.currentHeatmapModel === model;
  };

  toggleHeatmapModel = (model: HeatmapModel): void => {
    this.onHeatmapModelChange(this.currentHeatmapModel === model ? 'none' : model);
  };

  isHeatmapModelLoaded = (model: HeatmapModel): boolean => {
    return this.currentHeatmapModel !== model ? true : !this.heatmapLoading;
  };

  get category(): BandType {
    return bandTypesMap.get(this.bandTypesCategory) as BandType;
  }
}
