import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Subject } from 'rxjs';
import { Action } from '@ngrx/store';
import { provideZonelessChangeDetection } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ChangeBaselineDialogComponent } from './change-baseline-dialog.component';
import { DialogRef } from '@shared/dialog/dialog-ref';
import { UserActions } from '@data/user';
import { initialState as user } from '@data/user/user.reducers';

describe('ChangeBaselineDialogComponent', () => {
  let fixture: ComponentFixture<ChangeBaselineDialogComponent>;
  let component: ChangeBaselineDialogComponent;
  let store: MockStore;
  let actions$: Subject<Action>;
  let dialogRef: { close: jasmine.Spy };

  beforeEach(() => {
    actions$ = new Subject<Action>();
    dialogRef = { close: jasmine.createSpy('close') };
    TestBed.configureTestingModule({
      declarations: [ChangeBaselineDialogComponent],
      imports: [TranslateModule.forRoot(), MatRadioModule, MatProgressSpinnerModule],
      providers: [
        provideZonelessChangeDetection(),
        provideMockStore({ initialState: { user } }),
        provideMockActions(() => actions$),
        { provide: DialogRef, useValue: dialogRef }
      ]
    });
    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(ChangeBaselineDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('disables apply until a different baseline is selected', () => {
    component.activeBaselineId = 1;
    component.selectedBaselineId = 1;
    expect(component.isApplyDisabled).toBe(true);

    component.selectedBaselineId = 2;
    expect(component.isApplyDisabled).toBe(false);
  });

  it('disables apply while loading', () => {
    component.activeBaselineId = 1;
    component.selectedBaselineId = 2;
    component.loading = true;
    expect(component.isApplyDisabled).toBe(true);
  });

  it('dispatches updateUserSettings, sets loading, then closes on activeBaselineChanged', () => {
    const dispatchSpy = spyOn(store, 'dispatch');
    component.activeBaselineId = 1;
    component.selectedBaselineId = 2;

    component.apply();

    expect(component.loading).toBe(true);
    expect(dispatchSpy).toHaveBeenCalledWith(UserActions.updateUserSettings({ activeBaselineId: 2 }));

    actions$.next(UserActions.activeBaselineChanged({ baseline: { id: 2, name: 'B', description: '', locale: 'sv', validFrom: 0 } }));

    expect(component.loading).toBe(false);
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('clears loading and shows error on fetchBaselineFailure', () => {
    spyOn(store, 'dispatch');
    component.activeBaselineId = 1;
    component.selectedBaselineId = 2;

    component.apply();

    actions$.next(UserActions.fetchBaselineFailure({ error: { status: 404, message: 'Not found' } }));

    expect(component.loading).toBe(false);
    expect(component.error).toBe('Not found');
    expect(dialogRef.close).not.toHaveBeenCalled();
  });
});
