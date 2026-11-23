import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Subject } from 'rxjs';
import { Action } from '@ngrx/store';
import { provideZonelessChangeDetection } from '@angular/core';
import { TranslateSpecModule } from '@src/testing/translate-spec.module';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ChangeBaselineDialogComponent } from './change-baseline-dialog.component';
import { DialogRef } from '@shared/dialog/dialog-ref';
import { UserActions } from '@data/user';
import { initialState as user } from '@data/user/user.reducers';
import { Baseline } from '@data/user/user.interfaces';
import { By } from '@angular/platform-browser';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';

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
      imports: [TranslateSpecModule, MatRadioModule, MatProgressSpinnerModule],
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
    expect(dispatchSpy).toHaveBeenCalledWith(
      UserActions.updateUserSettings({ activeBaselineId: 2 })
    );

    actions$.next(
      UserActions.activeBaselineChanged({
        baseline: {
          id: 2,
          name: 'B',
          description: '',
          locale: 'sv',
          validFrom: 0,
          title: 'Some baseline'
        }
      })
    );

    expect(component.loading).toBe(false);
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('clears loading and shows error on fetchBaselineFailure', () => {
    spyOn(store, 'dispatch');
    component.activeBaselineId = 1;
    component.selectedBaselineId = 2;

    component.apply();

    actions$.next(
      UserActions.fetchBaselineFailure({ error: { status: 404, message: 'Not found' } })
    );

    expect(component.loading).toBe(false);
    expect(component.error).toBe('Not found');
    expect(dialogRef.close).not.toHaveBeenCalled();
  });
});

describe('ChangeBaselineDialogComponent selection', () => {
  const baselines: Baseline[] = [
    { id: 1, name: 'one', title: 'One', description: '', locale: 'sv', validFrom: 0 },
    { id: 2, name: 'two', title: 'Two', description: '', locale: 'sv', validFrom: 0 }
  ];
  let fixture: ComponentFixture<ChangeBaselineDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChangeBaselineDialogComponent],
      imports: [TranslateSpecModule, MatRadioModule, MatProgressSpinnerModule],
      providers: [
        provideZonelessChangeDetection(),
        provideMockStore({
          initialState: {
            user: { ...user, baseline: baselines[0], availableBaselines: baselines }
          }
        }),
        provideMockActions(() => new Subject<Action>()),
        { provide: DialogRef, useValue: { close: jasmine.createSpy('close') } }
      ]
    });
    fixture = TestBed.createComponent(ChangeBaselineDialogComponent);
    fixture.detectChanges();
  });

  function radios(): MatRadioButton[] {
    return fixture.debugElement
      .queryAll(By.css('mat-radio-button'))
      .map((d) => d.componentInstance as MatRadioButton);
  }

  it('starts with the active baseline selected and apply disabled', () => {
    expect(radios().map((r) => r.checked)).toEqual([true, false]);
    expect(fixture.componentInstance.isApplyDisabled).toBe(true);
  });

  it('selects a baseline when its radio is chosen', () => {
    // Change the group directly, without a click that would also reach the row's click handler.
    const group = fixture.debugElement
      .query(By.directive(MatRadioGroup))
      .injector.get(MatRadioGroup);
    group.selected = radios()[1];
    group._emitChangeEvent();
    fixture.detectChanges();

    expect(fixture.componentInstance.selectedBaselineId).toBe(2);
    expect(radios().map((r) => r.checked)).toEqual([false, true]);
    expect(fixture.componentInstance.isApplyDisabled).toBe(false);
  });

  it('selects a baseline when its row is clicked', () => {
    const rows = fixture.debugElement.queryAll(By.css('.baseline-option'));
    (rows[1].nativeElement as HTMLElement).click();
    fixture.detectChanges();

    expect(fixture.componentInstance.selectedBaselineId).toBe(2);
    expect(radios().map((r) => r.checked)).toEqual([false, true]);
  });
});
