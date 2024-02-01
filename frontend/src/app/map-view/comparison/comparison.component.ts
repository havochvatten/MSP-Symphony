import { AfterViewInit, Component, NgModuleRef, ViewChild } from '@angular/core';
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
import { CompoundComparisonListDialogComponent } from '@src/app/map-view/compound-comparison-list-dialog/compound-comparison-list-dialog.component';

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
    a: ['', Validators.required],
    b: ['', Validators.required]
  });
  @ViewChild('base') aSelect!: MatSelect;
  @ViewChild('candidates') bSelect!: MatSelect;
  loadingCandidates?: boolean;
  ScaleOptions = ComparisonScaleOptions;
  public selectedScale = ComparisonScaleOptions.CONSTANT;
  constant = 45;

  constructor(
    private store: Store<State>,
    private dialogService: DialogService,
    private calcService: CalculationService,
    private translate: TranslateService,
    private builder: FormBuilder,
    private moduleRef: NgModuleRef<never>
  ) {
    this.calculations$ = this.store.select(CalculationSelectors.selectCalculations);
  }

  ngAfterViewInit(): void {
    this.bSelect.disabled = true;
  }

  submit() {
    const that = this,
          a =  this.compareForm.value.a as string, b = this.compareForm.value.b as string,
          comparisonTitle = (this.aSelect.selected as MatOption).viewValue + ' ~ ' +
                                   (this.bSelect.selected as MatOption).viewValue,
          dynamic = this.selectedScale === ComparisonScaleOptions.DYNAMIC,
          constantVal = this.constant;
    this.calcService.addComparisonResult(a, b, dynamic, constantVal).then(
      (dynamicMax: number | null) => {
        const max = dynamicMax !== null ? Math.ceil(dynamicMax * 100) : this.constant;
        this.dialogService.open(ComparisonReportModalComponent, this.moduleRef, {
          data: { a, b, max }
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
      withLatestFrom(this.translate.get('map.compare.choose-scenario')),
      tap(([res, trans]) => {
        this.loadingCandidates = false;
        this.bSelect.placeholder = trans;
        this.bSelect.disabled = res.length === 0;
      }),
      map(([res]) => res)
    );
  }

  setComparisonScale(ev: MatRadioChange) {
    if(ev.source.checked) {
      this.selectedScale = ev.source.value;
    }
  }

  openCCList() {
    this.dialogService.open(CompoundComparisonListDialogComponent, this.moduleRef);
  }
}
