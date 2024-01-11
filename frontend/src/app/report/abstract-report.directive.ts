import { Directive } from '@angular/core';
import { formatPercent } from "@angular/common";
import { Store } from "@ngrx/store";
import { map, withLatestFrom } from "rxjs/operators";
import { Observable } from "rxjs";
import { TranslateService } from "@ngx-translate/core";
import buildInfo from "@src/build-info";
import { State } from "@src/app/app-reducer";
import { formatChartData } from "@src/app/report/report.util";
import { MetadataSelectors } from "@data/metadata";
import { CalculationActions, CalculationSelectors } from "@data/calculation";
import { BandGroup } from "@data/metadata/metadata.interfaces";

@Directive({
  selector: '[appAbstractReport]'
})
export class AbstractReport {

  protected locale = 'en';
  protected loadingReport = true;
  protected imageUrl?: string;

  protected readonly percentileValue$: Observable<number>; // FIXME: shouldn't be an observable!
  protected readonly bandDictionary$: Observable<{ [k: string] : { [p: string]: string } }>;
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

  constructor(
    translate: TranslateService,
    store: Store<State>
  ) {

    this.locale = translate.currentLang;
    this._metadata$ = store.select(MetadataSelectors.selectMetadata);
    this.bandDictionary$ = store.select(MetadataSelectors.selectMetaDisplayDictionary);
    this.percentileValue$ = store.select(CalculationSelectors.selectPercentileValue);

    this.metadata$ = this._metadata$.pipe(
      withLatestFrom(this.bandDictionary$, this.percentileValue$),
      map(([metadata, bandDictionary, percentileValue]) =>
        metadata && bandDictionary && percentileValue && metadata.ecoComponent.length > 0
          ? { metadata, bandDictionary, percentileValue }
          : null
      ));

    store.dispatch(CalculationActions.fetchPercentile());
  }
}
