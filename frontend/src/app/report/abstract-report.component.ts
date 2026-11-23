import { computed, signal, inject, Component } from '@angular/core';
import { formatPercent } from '@angular/common';
import { Store } from '@ngrx/store';
import { map, withLatestFrom } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { injectCurrentLocale } from '@shared/current-locale';
import buildInfo from '@src/build-info';
import { State } from '@src/app/app-reducer';
import { formatChartData } from '@src/app/report/report.util';
import { MetadataSelectors } from '@data/metadata';
import { CalculationActions, CalculationSelectors } from '@data/calculation';
import { BandGroup } from '@data/metadata/metadata.interfaces';

@Component({
  template: '',
  standalone: false
})
export abstract class AbstractReport<ReportType> {
  reportSignal = signal<ReportType | null>(null);
  report = computed(() => {
    return this.reportSignal()!;
  });

  protected readonly locale = injectCurrentLocale();
  protected loadingReport = true;
  protected imageUrl?: string;

  protected readonly percentileValue$: Observable<number>; // FIXME: shouldn't be an observable!
  protected readonly bandDictionary$: Observable<{ [k: string]: { [p: string]: string } }>;
  protected _metadata$: Observable<{
    ecoComponent: BandGroup[];
    pressureComponent: BandGroup[];
  }>;

  protected symphonyVersion = buildInfo.version;

  protected metadata$: Observable<{
    metadata: { ecoComponent: BandGroup[]; pressureComponent: BandGroup[] };
    bandDictionary: { [p: string]: { [p: string]: string } };
    percentileValue: number;
  } | null>;

  protected formatChartData = formatChartData;
  protected formatPercent = formatPercent;

  protected constructor() {
    const store = inject<Store<State>>(Store);

    this._metadata$ = store.select(MetadataSelectors.selectMetadata);
    this.bandDictionary$ = store.select(MetadataSelectors.selectMetaDisplayDictionary);
    this.percentileValue$ = store.select(CalculationSelectors.selectPercentileValue);

    this.metadata$ = this._metadata$.pipe(
      withLatestFrom(this.bandDictionary$, this.percentileValue$),
      map(([metadata, bandDictionary, percentileValue]) =>
        metadata && bandDictionary && percentileValue && metadata.ecoComponent.length > 0
          ? { metadata, bandDictionary, percentileValue }
          : null
      )
    );

    store.dispatch(CalculationActions.fetchPercentile());
  }
}
