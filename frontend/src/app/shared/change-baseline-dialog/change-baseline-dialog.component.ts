import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { race } from 'rxjs';
import { take } from 'rxjs/operators';
import { Actions, ofType } from '@ngrx/effects';

import { DialogRef } from '@shared/dialog/dialog-ref';
import { State } from '@src/app/app-reducer';
import { Baseline } from '@data/user/user.interfaces';
import { UserActions, UserSelectors } from '@data/user';

@Component({
  selector: 'app-change-baseline-dialog',
  templateUrl: './change-baseline-dialog.component.html',
  styleUrls: ['./change-baseline-dialog.component.scss'],
  standalone: false
})
export class ChangeBaselineDialogComponent {
  private readonly dialog = inject(DialogRef);
  private readonly store = inject<Store<State>>(Store);
  private readonly actions$ = inject(Actions);

  availableBaselines: Baseline[] = [];
  selectedBaselineId: number | undefined;
  activeBaselineId: number | undefined;
  loading = false;
  error: string | undefined;

  constructor() {
    this.store
      .select(UserSelectors.selectAvailableBaselines)
      .pipe(take(1))
      .subscribe((baselines) => {
        this.availableBaselines = baselines;
      });

    this.store
      .select(UserSelectors.selectBaseline)
      .pipe(take(1))
      .subscribe((baseline) => {
        this.activeBaselineId = baseline?.id;
        this.selectedBaselineId = baseline?.id;
      });
  }

  get isApplyDisabled(): boolean {
    return this.selectedBaselineId === this.activeBaselineId || this.loading;
  }

  close() {
    this.dialog.close();
  }

  apply() {
    if (this.selectedBaselineId === undefined) return;
    this.loading = true;
    this.error = undefined;
    race(
      this.actions$.pipe(ofType(UserActions.activeBaselineChanged), take(1)),
      this.actions$.pipe(ofType(UserActions.fetchBaselineFailure), take(1))
    ).subscribe((action) => {
      this.loading = false;
      if (action.type === UserActions.fetchBaselineFailure.type) {
        this.error = (action as ReturnType<typeof UserActions.fetchBaselineFailure>).error?.message
          ?? 'change-baseline-modal.error';
      } else {
        this.dialog.close();
      }
    });
    this.store.dispatch(UserActions.updateUserSettings({ activeBaselineId: this.selectedBaselineId }));
  }
}
