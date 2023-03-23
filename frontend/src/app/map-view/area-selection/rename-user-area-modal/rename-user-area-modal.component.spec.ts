import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';
import { DialogRef } from '@src/app/shared/dialog/dialog-ref';
import { DialogConfig } from '@src/app/shared/dialog/dialog-config';

import { RenameUserAreaModalComponent } from './rename-user-area-modal.component';

describe('RenameUserAreaModalComponent', () => {
  let fixture: ComponentFixture<RenameUserAreaModalComponent>,
      component: RenameUserAreaModalComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [RenameUserAreaModalComponent],
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
    fixture = TestBed.createComponent(RenameUserAreaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
