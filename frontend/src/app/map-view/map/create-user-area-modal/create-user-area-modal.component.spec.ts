import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';
import { DialogRef } from '@src/app/shared/dialog/dialog-ref';
import { DialogConfig } from '@src/app/shared/dialog/dialog-config';

import { CreateUserAreaModalComponent } from './create-user-area-modal.component';

describe('CreateUserAreaModalComponent', () => {
  let fixture: ComponentFixture<CreateUserAreaModalComponent>,
      component: CreateUserAreaModalComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CreateUserAreaModalComponent],
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
    fixture = TestBed.createComponent(CreateUserAreaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
