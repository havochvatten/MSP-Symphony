import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { DialogService } from "@shared/dialog/dialog.service";
import { DialogRef } from "@shared/dialog/dialog-ref";
import { DialogConfig } from "@shared/dialog/dialog-config";
import { SetArbitraryMatrixComponent } from './set-arbitrary-matrix.component';
import { TranslateModule } from "@ngx-translate/core";
import { provideMockStore } from '@ngrx/store/testing';
import { initialState as area } from "@data/area/area.reducers";
import { MatSelectModule } from "@angular/material/select";

describe('SetArbitraryMatrixComponent', () => {
  let component: SetArbitraryMatrixComponent;
  let fixture: ComponentFixture<SetArbitraryMatrixComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        MatSelectModule,
        TranslateModule.forRoot()
      ],
      providers: [
        DialogService,
        DialogRef,
        {
          provide: DialogConfig,
          useValue: {
            data: {
              matrices: [],
              areaName: ''
            }
          }
        },
        provideMockStore({
          initialState: {
            area
          }
        })
      ],
      declarations: [SetArbitraryMatrixComponent]
    });
    fixture = TestBed.createComponent(SetArbitraryMatrixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
