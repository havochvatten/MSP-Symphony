import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DialogRef } from '@src/app/shared/dialog/dialog-ref';
import { DialogService } from '@src/app/shared/dialog/dialog.service';
import { SharedModule } from "@shared/shared.module";
import { initialState as calculation } from '@data/calculation/calculation.reducers';

import { CompoundComparisonListDialogComponent } from './compound-comparison-list-dialog.component';

describe('CompoundComparisonListDialogComponent', () => {
  let component: CompoundComparisonListDialogComponent;
  let fixture: ComponentFixture<CompoundComparisonListDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        StoreModule.forRoot({},{}),
        TranslateModule.forRoot()
      ],
      providers: [
        DialogService,
        DialogRef,
        TranslateService,
        provideMockStore({
          initialState: {
            calculation
          }
        })
      ],
      declarations: [CompoundComparisonListDialogComponent]
    });
    fixture = TestBed.createComponent(CompoundComparisonListDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
