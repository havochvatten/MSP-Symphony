import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HavButtonModule, HavCoreModule } from 'hav-components';

import { CalculationReportModalComponent } from './calculation-report-modal.component';
import { IconButtonComponent } from '../icon-button/icon-button.component';
import { IconComponent } from '../icon/icon.component';
import { DialogRef } from '../dialog/dialog-ref';
import { DialogConfig } from '../dialog/dialog-config';
import { HttpClientModule } from '@angular/common/http';
import { provideMockStore } from '@ngrx/store/testing';
import { initialState as metadata } from '@data/metadata/metadata.reducers';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';

function setUp() {
  const fixture: ComponentFixture<CalculationReportModalComponent> = TestBed.createComponent(CalculationReportModalComponent);
  const component: CalculationReportModalComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('CalculationReportModalComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CalculationReportModalComponent, IconButtonComponent, IconComponent],
      imports: [HavButtonModule, HavCoreModule, HttpClientModule, TranslationSetupModule],
      providers: [
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
            metadata
          }
        })
      ]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = setUp();
    expect(component).toBeTruthy();
  });
});
