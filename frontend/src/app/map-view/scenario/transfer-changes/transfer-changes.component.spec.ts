import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreModule } from "@ngrx/store";
import { DialogService } from "@shared/dialog/dialog.service";
import { DialogRef } from "@shared/dialog/dialog-ref";
import { DialogConfig } from '@shared/dialog/dialog-config';
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { TransferChangesComponent } from './transfer-changes.component';

describe('TransferChangesComponent', () => {
  let component: TransferChangesComponent;
  let fixture: ComponentFixture<TransferChangesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
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
