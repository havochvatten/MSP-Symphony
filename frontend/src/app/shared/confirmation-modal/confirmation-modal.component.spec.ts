import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationModalComponent } from './confirmation-modal.component';
import { DialogRef } from "@shared/dialog/dialog-ref";
import { DialogConfig } from "../dialog/dialog-config";
import { TranslateModule } from "@ngx-translate/core";
import { MatLegacyButtonModule as MatButtonModule } from "@angular/material/legacy-button";

describe('ConfirmationModalComponent', () => {
  let component: ConfirmationModalComponent;
  let fixture: ComponentFixture<ConfirmationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatButtonModule,
        TranslateModule.forRoot()
      ],
      providers: [ DialogRef,
        {
          provide: DialogConfig,
          useValue: {
            data: {
              header: ''
            }
          }
        }
    ],
      declarations: [ ConfirmationModalComponent ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
