import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogService } from "@shared/dialog/dialog.service";
import { DialogRef } from "@shared/dialog/dialog-ref";
import { DialogConfig } from "@shared/dialog/dialog-config";
import { SetArbitraryMatrixComponent } from './set-arbitrary-matrix.component';
import { TranslateModule } from "@ngx-translate/core";


describe('SetArbitraryMatrixComponent', () => {
  let component: SetArbitraryMatrixComponent;
  let fixture: ComponentFixture<SetArbitraryMatrixComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
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
        }
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
