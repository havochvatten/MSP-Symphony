import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreModule } from "@ngrx/store";
import { DialogService } from "@shared/dialog/dialog.service";
import { DialogRef } from "@shared/dialog/dialog-ref";
import { DialogConfig } from '@shared/dialog/dialog-config';
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { TransferChangesComponent } from './transfer-changes.component';
import { MatLegacyFormField as MatFormField, MatLegacyLabel as MatLabel } from "@angular/material/legacy-form-field";
import { MatLegacyRadioButton as MatRadioButton, MatLegacyRadioGroup as MatRadioGroup, MatLegacyRadioModule as MatRadioModule } from "@angular/material/legacy-radio";
import { MatLegacyCheckbox as MatCheckbox, MatLegacyCheckboxModule as MatCheckboxModule } from "@angular/material/legacy-checkbox";
import { MatLegacySelect as MatSelect, MatLegacySelectModule as MatSelectModule } from "@angular/material/legacy-select";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FormsModule } from "@angular/forms";

describe('TransferChangesComponent', () => {
  let component: TransferChangesComponent;
  let fixture: ComponentFixture<TransferChangesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        MatSelectModule,
        MatRadioModule,
        MatCheckboxModule,
        StoreModule.forRoot({}, {}),
        TranslateModule.forRoot()
      ],
      providers: [
        DialogService,
        DialogRef,
        TranslateService,
        {
          provide: DialogConfig,
          useValue: {
            data: {
              target: {
                areas: []
              }
            }
          }
        }
      ],
      declarations: [ TransferChangesComponent,
                      MatFormField, MatLabel, MatRadioGroup, MatRadioButton,
                      MatCheckbox, MatSelect ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransferChangesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
