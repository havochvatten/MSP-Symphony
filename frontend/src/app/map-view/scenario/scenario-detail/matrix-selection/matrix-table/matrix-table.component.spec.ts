import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DialogRef } from '@shared/dialog/dialog-ref';
import { DialogConfig } from '@shared/dialog/dialog-config';

import { MatrixTableComponent } from './matrix-table.component';
import { HttpClientModule } from '@angular/common/http';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';
import { IconComponent } from "@shared/icon/icon.component";

describe('MatrixTableComponent', () => {
  let fixture: ComponentFixture<MatrixTableComponent>,
      component: MatrixTableComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MatrixTableComponent, IconComponent],
      imports: [HttpClientModule, TranslationSetupModule],
      providers: [
        {
          provide: DialogRef,
          useValue: {}
        },
        {
          provide: DialogConfig,
          useValue: {
            data: {
              matrixData: {
                name: '',
                sensMatrix: { rows: [] }
              }
            }
          }
        },
        provideMockStore({ initialState: { user: { baseline: undefined } } })
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(MatrixTableComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
