import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';
import { DialogRef } from '@shared/dialog/dialog-ref';
import { DialogConfig } from '@shared/dialog/dialog-config';

import { RenameItemModalComponent } from './rename-item-modal.component';
import { provideMockStore } from "@ngrx/store/testing";

describe('RenameItemModalComponent', () => {
  let fixture: ComponentFixture<RenameItemModalComponent>,
      component: RenameItemModalComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [RenameItemModalComponent],
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
              headerText: '',
              itemName: ''
            }
          }
        },
        provideMockStore({ initialState : { user: {} } })
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(RenameItemModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
