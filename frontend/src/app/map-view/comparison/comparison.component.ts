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

/*export const sameCalculationsValidator: ValidatorFn = (control: AbstractControl):
  ValidationErrors | null => {
    const a = control.get('a');
    const b = control.get('b');
    return a && b && a.value === b.value ? { identicalCalculations: true } : null;
}*/

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

  constructor(
    private store: Store<State>,
    private dialogService: DialogService,
    private calcService: CalculationService,
    private translate: TranslateService,
    private builder: FormBuilder,
    private moduleRef: NgModuleRef<any>
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
          dynamic = this.selectedScale === ComparisonScaleOptions.DYNAMIC;
    this.calcService.addComparisonResult(a, b, dynamic).then(
      (dynamicMax: number | null) => {
        this.dialogService.open(ComparisonReportModalComponent, this.moduleRef, {
          data: { a, b, dynamicMax }
        });
        if(dynamic) {
          that.store.dispatch(CalculationActions.fetchDynamicComparisonLegend({ dynamicMax: dynamicMax || 0, comparisonTitle }));
        } else {
            that.store.dispatch(CalculationActions.fetchComparisonLegend({ comparisonTitle }));
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
      map(([res, _]) => res)
    );
  }

  setComparisonScale(scale: ComparisonScaleOptions) {
    this.selectedScale = scale;
  }
}
