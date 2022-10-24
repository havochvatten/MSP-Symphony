import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DialogRef } from '@shared/dialog/dialog-ref';
import { DialogConfig } from '@shared/dialog/dialog-config';

import { MatrixTableComponent } from './matrix-table.component';
import { HttpClientModule } from '@angular/common/http';
import { provideMockStore } from '@ngrx/store/testing';
import { HavCoreModule, HavButtonModule } from 'hav-components';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';

function setUp() {
  const fixture: ComponentFixture<MatrixTableComponent> = TestBed.createComponent(MatrixTableComponent);
  const component: MatrixTableComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('MatrixTableComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MatrixTableComponent],
      imports: [HttpClientModule, HavCoreModule, HavButtonModule, TranslationSetupModule],
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
                name: ''
              }
            }
          }
        },
        provideMockStore({ initialState: { user: { baseline: undefined } } })
      ]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = setUp();
    expect(component).toBeTruthy();
  });
});
