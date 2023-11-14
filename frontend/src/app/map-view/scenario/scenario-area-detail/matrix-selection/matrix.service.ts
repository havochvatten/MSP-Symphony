import { Injectable, OnDestroy } from '@angular/core';
import { environment as env } from '@src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { State } from '@src/app/app-reducer';
import { UserSelectors } from '@data/user';
import { SensitivityMatrix } from './matrix.interfaces';
import { Subscription } from 'rxjs';
import { TranslateService } from "@ngx-translate/core";

@Injectable({
  providedIn: 'root'
})
export class MatrixService implements OnDestroy {
  baseline = '';
  baselineSubscription?: Subscription;

  private langParam = `?lang=${this.translate.currentLang}`;

  constructor(private http: HttpClient, private store: Store<State>,
              private translate: TranslateService) {
    this.baselineSubscription = this.store.select(UserSelectors.selectBaseline).subscribe(baseline => {
      if (baseline) {
        this.baseline = baseline.name;
      }
    });
  }

  getSensitivityMatrix(matrixId: number) {
    return this.http.get<SensitivityMatrix>(`${env.apiBaseUrl}/sensitivitymatrix/id/${matrixId}${this.langParam}`);
  }

  createSensitivityMatrixForArea(areaId: number, sensitivityMatrix: SensitivityMatrix) {
    return this.http.post<SensitivityMatrix>(
      `${env.apiBaseUrl}/sensitivitymatrix/${this.baseline}/${areaId}${this.langParam}`,
      sensitivityMatrix
    );
  }

  updateSensitivityMatrix(matrixId: number, sensitivityMatrix: SensitivityMatrix) {
    return this.http.put<SensitivityMatrix>(
      `${env.apiBaseUrl}/sensitivitymatrix/${matrixId}${this.langParam}`,
      sensitivityMatrix
    );
  }

  deleteSensitivityMatrix(matrixId: number) {
    return this.http.delete(`${env.apiBaseUrl}/sensitivitymatrix/${matrixId}`);
  }

  ngOnDestroy() {
    if (this.baselineSubscription) {
      this.baselineSubscription.unsubscribe();
    }
  }
}
