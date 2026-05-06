import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';
import { DialogRef } from '@shared/dialog/dialog-ref';
import { DialogConfig } from '@shared/dialog/dialog-config';

import { CreateUserAreaModalComponent } from './create-user-area-modal.component';
import { provideMockStore } from "@ngrx/store/testing";
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

describe('CreateUserAreaModalComponent', () => {
  let fixture: ComponentFixture<CreateUserAreaModalComponent>,
      component: CreateUserAreaModalComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CreateUserAreaModalComponent
      ],
      imports: [
        TranslationSetupModule,
        HttpClientTestingModule,
        ReactiveFormsModule,
        FormsModule
      ],
      providers: [
        {
          provide: DialogRef,
          useValue: {close: () => {} }
        },
        {
          provide: DialogConfig,
          useValue: {
            data: {
              areaName: ''
            }
          }
        },
        provideMockStore({ initialState : { user: {} } })
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
