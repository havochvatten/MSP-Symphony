import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StoreModule } from "@ngrx/store";

import { DeleteCalculationConfirmationDialogComponent } from './delete-calculation-confirmation-dialog.component';
import { DialogService } from "@shared/dialog/dialog.service";
import { DialogRef } from "@shared/dialog/dialog-ref";
import { DialogConfig } from "@shared/dialog/dialog-config";
import { TranslateModule, TranslateService } from "@ngx-translate/core";

describe('DeleteCalculationConfirmationDialogComponent', () => {
  let component: DeleteCalculationConfirmationDialogComponent;
  let fixture: ComponentFixture<DeleteCalculationConfirmationDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({},{}),
        TranslateModule.forRoot()
      ],
      providers: [ DialogService, DialogRef, TranslateService,
        {
          provide: DialogConfig,
          useValue: {
            data: { calculationName: '' }
          }
        }],
      declarations: [ DeleteCalculationConfirmationDialogComponent ]
    }).compileComponents();
    fixture = TestBed.createComponent(DeleteCalculationConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
