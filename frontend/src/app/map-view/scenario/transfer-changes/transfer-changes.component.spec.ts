import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreModule } from "@ngrx/store";
import { provideMockStore } from "@ngrx/store/testing";
import { DialogService } from "@shared/dialog/dialog.service";
import { DialogRef } from "@shared/dialog/dialog-ref";
import { DialogConfig } from '@shared/dialog/dialog-config';
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { TransferChangesComponent } from './transfer-changes.component';
import { MatRadioModule } from "@angular/material/radio";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatSelectModule } from "@angular/material/select";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FormsModule } from "@angular/forms";
import { initialState as scenario } from '@data/scenario/scenario.reducers'

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
        },
        provideMockStore({
          initialState: {
            scenario
          }
        })
      ],
      declarations: [ TransferChangesComponent ]
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
