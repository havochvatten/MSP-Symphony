import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CalculationReportModalComponent } from './calculation-report-modal.component';
import { IconButtonComponent } from '../icon-button/icon-button.component';
import { IconComponent } from '../icon/icon.component';
import { DialogRef } from '../dialog/dialog-ref';
import { DialogConfig } from '../dialog/dialog-config';
import { provideHttpClient } from '@angular/common/http';
import { provideMockStore } from '@ngrx/store/testing';
import { initialState as metadata } from '@data/metadata/metadata.reducers';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';
import { provideZonelessChangeDetection } from "@angular/core";

describe('CalculationReportModalComponent', () => {
  let fixture: ComponentFixture<CalculationReportModalComponent>,
      component: CalculationReportModalComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CalculationReportModalComponent, IconButtonComponent, IconComponent],
      imports: [TranslationSetupModule],
      providers: [
        provideHttpClient(),
        {
          provide: DialogRef,
          useValue: {}
        },
        {
          provide: DialogConfig,
          useValue: {
            data: {
              reportId: 1
            }
          }
        },
        provideMockStore({
          initialState: {
            metadata,
            user : {}
          }
        }),
        provideZonelessChangeDetection()
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(CalculationReportModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
