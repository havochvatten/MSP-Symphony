import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DialogRef } from '@src/app/shared/dialog/dialog-ref';
import { DialogConfig } from '@src/app/shared/dialog/dialog-config';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';

import { DeleteUserAreaConfirmationDialogComponent } from './delete-user-area-confirmation-dialog.component';

describe('DeleteUserAreaConfirmationDialogComponent', () => {
  let fixture: ComponentFixture<DeleteUserAreaConfirmationDialogComponent>,
      component: DeleteUserAreaConfirmationDialogComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DeleteUserAreaConfirmationDialogComponent],
      imports: [TranslationSetupModule],
      providers: [
        {
          provide: DialogRef,
          useValue: {}
        },
        {
          provide: DialogConfig,
          useValue: {
            data: {
              areaName: ''
            }
          }
        }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(DeleteUserAreaConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
