import { AfterViewInit, Component, NgModuleRef, ViewChild } from '@angular/core';
import { Store } from "@ngrx/store";
import { State } from '@src/app/app-reducer';
import { Observable } from 'rxjs';
import { CalculationSlice } from '@data/calculation/calculation.interfaces';
import { CalculationSelectors } from '@data/calculation';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; //ValidationErrors, ValidatorFn
import { DialogService } from '@shared/dialog/dialog.service';
import { ComparisonReportModalComponent } from '@shared/report-modal/comparison-report-modal.component';
import { CalculationService } from '@data/calculation/calculation.service';
import { map, tap, withLatestFrom } from 'rxjs/operators';
import { SelectComponent } from 'hav-components';
import { TranslateService } from "@ngx-translate/core";

/*export const sameCalculationsValidator: ValidatorFn = (control: AbstractControl):
  ValidationErrors | null => {
    const a = control.get('a');
    const b = control.get('b');
    return a && b && a.value === b.value ? { identicalCalculations: true } : null;
}*/

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
  @ViewChild('candidates') bSelect!: SelectComponent;
  loadingCandidates?: boolean;

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
    const a =  this.compareForm.value.a as string, b = this.compareForm.value.b as string;
    this.dialogService.open(ComparisonReportModalComponent, this.moduleRef, {
      data: { a, b }
    });
    this.calcService.addComparisonResult(a, b)
      .catch(e => console.warn(e));
  }

  async changeBase(id: string) {
    this.bSelect.disabled = true;
    this.loadingCandidates = true;

    this.candidates$ = this.calcService.getMatchingCalculations(id).pipe(
      withLatestFrom(this.translate.get('map.compare.choose-scenario')),
      tap(([res, trans]) => {
        this.loadingCandidates = false;
        this.bSelect.noItemSelectedLabel = trans;
        this.bSelect.disabled = res.length === 0;
      }),
      map(([res, _]) => res)
    );
  }
}
