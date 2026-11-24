import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmResetComponent } from './confirm-reset.component';
import { StoreModule } from '@ngrx/store';
import { DialogService } from '@shared/dialog/dialog.service';
import { DialogRef } from '@shared/dialog/dialog-ref';
import { TranslateService } from '@ngx-translate/core';
import { TranslateSpecModule } from '@src/testing/translate-spec.module';
import { provideMockStore } from '@ngrx/store/testing';
import { provideZonelessChangeDetection } from '@angular/core';

describe('ConfirmResetComponent', () => {
  let component: ConfirmResetComponent;
  let fixture: ComponentFixture<ConfirmResetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({}, {}), TranslateSpecModule],
      providers: [
        DialogService,
        DialogRef,
        TranslateService,
        provideMockStore({
          initialState: {
            user: { baseline: undefined }
          }
        }),
        provideZonelessChangeDetection()
      ],
      declarations: [ConfirmResetComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(ConfirmResetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
