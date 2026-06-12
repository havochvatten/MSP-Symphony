import { AfterViewInit, Component, NgModuleRef, OnDestroy, ViewChild, inject } from '@angular/core';
import { Store } from "@ngrx/store";
import { State } from '@src/app/app-reducer';
import { Observable, Subscription } from 'rxjs';
import { CalculationSlice } from '@data/calculation/calculation.interfaces';
import { CalculationActions, CalculationSelectors } from '@data/calculation';
import { UserSelectors } from '@data/user';
import { FormBuilder, Validators } from '@angular/forms'; //ValidationErrors, ValidatorFn
import { DialogService } from '@shared/dialog/dialog.service';
import { ComparisonReportModalComponent } from '@shared/report-modal/comparison-report-modal.component';
import { CalculationService } from '@data/calculation/calculation.service';
import { map, skip, tap } from 'rxjs/operators';
import { TranslateService } from "@ngx-translate/core";
import { MatSelect } from "@angular/material/select";
import { MatOption } from "@angular/material/core";
import { MatRadioChange } from "@angular/material/radio";
import { MatCheckboxChange } from "@angular/material/checkbox";
import { MapViewModule } from "@src/app/map-view/map-view.module";

enum ComparisonScaleOptions { CONSTANT, DYNAMIC }

@Component({
  selector: 'app-comparison',
  templateUrl: './comparison.component.html',
  styleUrls: ['./comparison.component.scss'],
  standalone: false
})
export class ComparisonComponent implements AfterViewInit, OnDestroy {
  private readonly store = inject<Store<State>>(Store);
  private readonly dialogService = inject(DialogService);
  private readonly calcService = inject(CalculationService);
  private readonly translate = inject(TranslateService);
  private readonly builder = inject(FormBuilder);
  private readonly moduleRef = inject(NgModuleRef<MapViewModule>)

  calculations$?: Observable<CalculationSlice[]>;
  candidates$?: Observable<CalculationSlice[]>;
  compareForm = this.builder.group({
    b: ['', Validators.required]
  });
  @ViewChild('base') aSelect!: MatSelect;
  @ViewChild('candidates') bSelect!: MatSelect;
  loadingCandidates?: boolean;
  ScaleOptions = ComparisonScaleOptions;
  public selectedScale = ComparisonScaleOptions.CONSTANT;
  constant = 45;
  useImplicit = true;
  includeUnchanged = false;
  reverseComparison = false;
  computingComparisonResult = false;
  private baselineSubscription?: Subscription;

  constructor() {
    this.calculations$ = this.store.select(CalculationSelectors.selectCalculations);
    this.candidates$ = this.store.select(CalculationSelectors.selectChangedCalculations);

    this.baselineSubscription = this.store.select(UserSelectors.selectBaseline)
      .pipe(skip(1))
      .subscribe(() => this.resetForBaselineSwitch());
  }

  ngAfterViewInit(): void {
    this.bSelect.disabled = !this.useImplicit;
  }

  ngOnDestroy(): void {
    this.baselineSubscription?.unsubscribe();
  }

  private resetForBaselineSwitch() {
    this.useImplicit = true;
    this.includeUnchanged = false;
    this.candidates$ = this.store.select(CalculationSelectors.selectChangedCalculations);
    this.compareForm.controls.b.reset();
    if (this.aSelect) {
      this.aSelect.value = null;
    }
    if (this.bSelect) {
      this.bSelect.value = null;
      this.bSelect.disabled = false;
    }
    this.loadingCandidates = false;
  }

  submit() {
    this.computingComparisonResult = true;
    const a = this.useImplicit ? null : this.aSelect.value;
    const that = this,
      b = this.compareForm.value.b as string,
      aTitle = this.useImplicit ?
        this.translate.instant('map.compare.implicit-baseline') :
        (this.aSelect.selected as MatOption).viewValue,
      comparisonTitle = aTitle + ' ~ ' + (this.bSelect.selected as MatOption).viewValue,
      dynamic = this.selectedScale === ComparisonScaleOptions.DYNAMIC,
      constantVal = this.constant,
      reverse = this.reverseComparison
    this.calcService.addComparisonResult(a, b, dynamic, constantVal, reverse).then(
      (dynamicMax: number | null) => {
        const max = dynamicMax !== null ? Math.ceil(dynamicMax * 100) : this.constant;
        this.dialogService.open(ComparisonReportModalComponent, this.moduleRef, {
          data: { a, b, max, reverse }
        });
        if(dynamic) {
          that.store.dispatch(CalculationActions.fetchComparisonLegend({ maxValue: dynamicMax || 0, comparisonTitle }));
        } else {
          that.store.dispatch(CalculationActions.fetchComparisonLegend({ maxValue: that.constant / 100, comparisonTitle }));
        }
      }
    )
      .catch(e => console.warn(e))
      .finally(() => {
        that.computingComparisonResult = false;
      });
  }

  async changeBase(id: number) {
    this.bSelect.disabled = true;
    this.loadingCandidates = true;

    this.candidates$ = this.calcService.getMatchingCalculations(id.toString()).pipe(
      map((res) => res.filter(c => this.includeUnchanged || c.hasChanges)),
      tap((candidates) => {
        this.bSelect.disabled = candidates.length === 0;
        this.loadingCandidates = false;
      })
    );
  }

  setComparisonScale(ev: MatRadioChange) {
    if(ev.source.checked) {
      this.selectedScale = ev.source.value;
    }
  }

  targetScenarioPlaceHolderKey(hasCandidates : boolean): string {
    if (this.useImplicit) {
      return 'map.compare.select-calculation';
    }

    if (!this.aSelect.value) {
      return 'map.compare.select-base-calculation-first';
    }

    if (hasCandidates) {
      return 'map.compare.select-calculation';
    } else {
      return 'map.compare.no-matching-calculations';
    }
  }

  async setImplicit($event: MatRadioChange) {
    this.useImplicit = $event.source.value;
    this.bSelect.disabled = !this.useImplicit;

    if (this.useImplicit) {
      this.aSelect.value = null;
      await this.setIncludeUnchanged(false);
    } else {
      this.bSelect.value = null;
    }
  }

  async setIncludeUnchanged(includeUnchanged: boolean) {
    this.includeUnchanged = includeUnchanged;

    if(!this.includeUnchanged) {
      this.bSelect.value = null;
    }

    if(this.useImplicit) {
      this.candidates$ = this.includeUnchanged ?
        this.store.select(CalculationSelectors.selectCalculations) :
        this.store.select(CalculationSelectors.selectChangedCalculations);
    } else {
      if(this.aSelect.value) {
        await this.changeBase(this.aSelect.value as number);
      }
    }
  }

  setReverseProjected($event: MatCheckboxChange) {
    this.reverseComparison = $event.checked;
  }
}
