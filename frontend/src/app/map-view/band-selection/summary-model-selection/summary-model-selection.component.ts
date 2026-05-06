import { ChangeDetectorRef, Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { BandType_Alt } from '@data/metadata/metadata.interfaces';
import { CalculationActions, CalculationSelectors } from '@data/calculation';
import { SummaryModel, SummaryModelCategory } from '@data/calculation/calculation.interfaces';
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

  summaryModelRows: ReadonlyArray<{ model: string; labelKey: string }> = [];

  @Input() modelCategory: BandType_Alt = 'ecoComponents';
  @Input() scenarioActive = false;

  summaryModel$?: Observable<SummaryModel>;
  currentSummaryModel: SummaryModel = 'none';
  summaryModelLoading = false;

  private currentSummaryModelSubscription?: Subscription;
  private summaryModelLoadingSubscription?: Subscription;
  private summaryModelsSubscription?: Subscription;

  ngOnInit() {
    const category = this.getSummaryModelCategory(this.modelCategory);

    this.summaryModelsSubscription = this.store
      .select(CalculationSelectors.selectAvailableSummaryModels(category))
      .subscribe((models) => {
        this.summaryModelRows = models.map((model) => ({
          model,
          labelKey: `map.summary-model.${model}`
        }));
        this.cdr.markForCheck();
      });

    this.summaryModel$ = this.store
      .select(CalculationSelectors.selectVisibleSummaryModels)
      .pipe(map((models) => models[category]));

    this.currentSummaryModelSubscription = this.summaryModel$.subscribe((model) => {
      this.currentSummaryModel = model;
    });

    this.summaryModelLoadingSubscription = this.store
      .select(CalculationSelectors.selectSummaryModelLoading(category))
      .subscribe((loading) => {
        this.summaryModelLoading = loading;
        this.cdr.markForCheck();
      });
  }

  public getSummaryModelCategory(bandTypesCategory: BandType_Alt): SummaryModelCategory {
    return bandTypesCategory === 'ecoComponents' ? 'ECOSYSTEM' : 'PRESSURE';
  }

  ngOnDestroy() {
    this.currentSummaryModelSubscription?.unsubscribe();
    this.summaryModelLoadingSubscription?.unsubscribe();
    this.summaryModelsSubscription?.unsubscribe();
  }

  onSummaryModelChange(model: string) {
    const category = this.getSummaryModelCategory(this.modelCategory);
    this.store.dispatch(
      CalculationActions.setSummaryModel({
        category: category as SummaryModelCategory,
        model: model as SummaryModel
      })
    );
  }

  isSummaryModelSelected = (model: string): boolean => {
    return this.currentSummaryModel === model;
  };

  toggleSummaryModel = (model: string): void => {
    this.onSummaryModelChange(this.currentSummaryModel === model ? 'none' : model);
  };

  isSummaryModelLoaded = (model: string): boolean => {
    return this.currentSummaryModel !== model ? true : !this.summaryModelLoading;
  };
}
