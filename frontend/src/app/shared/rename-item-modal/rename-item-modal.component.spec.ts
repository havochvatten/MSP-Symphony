import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';
import { DialogRef } from '@shared/dialog/dialog-ref';
import { DialogConfig } from '@shared/dialog/dialog-config';

import { RenameItemModalComponent } from './rename-item-modal.component';
import { provideMockStore } from "@ngrx/store/testing";
import { provideZonelessChangeDetection } from "@angular/core";

describe('RenameItemModalComponent', () => {
  let fixture: ComponentFixture<RenameItemModalComponent>,
      component: RenameItemModalComponent;

  beforeEach(() => {
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
        provideMockStore({ initialState : { user: {} } }),
        provideZonelessChangeDetection()
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(RenameItemModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
