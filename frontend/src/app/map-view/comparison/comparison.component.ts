import { AfterViewInit, ChangeDetectorRef, Component, NgModuleRef, ViewChild } from '@angular/core';
import { Store } from "@ngrx/store";
import { State } from '@src/app/app-reducer';
import { Observable } from 'rxjs';
import { CalculationSlice } from '@data/calculation/calculation.interfaces';
import { CalculationActions, CalculationSelectors } from '@data/calculation';
import { FormBuilder, Validators } from '@angular/forms'; //ValidationErrors, ValidatorFn
import { DialogService } from '@shared/dialog/dialog.service';
import { ComparisonReportModalComponent } from '@shared/report-modal/comparison-report-modal.component';
import { CalculationService } from '@data/calculation/calculation.service';
import { map, tap, withLatestFrom } from 'rxjs/operators';
import { TranslateService } from "@ngx-translate/core";
import { MatSelect } from "@angular/material/select";
import { MatOption } from "@angular/material/core";
import { MatRadioChange } from "@angular/material/radio";
import { MatCheckboxChange } from "@angular/material/checkbox";

enum ComparisonScaleOptions { CONSTANT, DYNAMIC }

@Component({
  selector: 'app-comparison',
  templateUrl: './comparison.component.html',
  styleUrls: ['./comparison.component.scss']
})
export class ComparisonComponent implements AfterViewInit {
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

  constructor(
    private store: Store<State>,
    private dialogService: DialogService,
    private calcService: CalculationService,
    private translate: TranslateService,
    private builder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private moduleRef: NgModuleRef<never>
  ) {
    this.calculations$ = this.store.select(CalculationSelectors.selectCalculations);
    this.candidates$ = this.store.select(CalculationSelectors.selectChangedCalculations);
  }

  ngAfterViewInit(): void {
    this.bSelect.disabled = !this.useImplicit;
  }

  submit() {
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
      .catch(e => console.warn(e));
  }

  async changeBase(id: number) {
    this.bSelect.disabled = true;
    this.loadingCandidates = true;

    this.candidates$ = this.calcService.getMatchingCalculations(id.toString()).pipe(
      tap((res) => {
        const emptyList = res.filter(c => this.includeUnchanged || c.hasChanges).length === 0
        this.loadingCandidates = false;
        this.bSelect.placeholder =
          this.translate.instant(
            emptyList ? 'map.compare.no-matching-calculations' :
                             'map.compare.select-calculation');
        this.bSelect.disabled = emptyList;
        this.cdr.detectChanges();
      }),
      map((res) => res.filter(c => this.includeUnchanged || c.hasChanges))
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
