import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectIntersectionComponent } from './select-intersection.component';
import { DialogService } from "@shared/dialog/dialog.service";
import { DialogRef } from "@shared/dialog/dialog-ref";
import { DialogConfig } from "@shared/dialog/dialog-config";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { MatLegacyRadioModule as MatRadioModule } from "@angular/material/legacy-radio";

describe('SelectIntersectionComponent', () => {
  let component: SelectIntersectionComponent;
  let fixture: ComponentFixture<SelectIntersectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports : [
        TranslateModule.forRoot(),
        MatRadioModule
      ],
      providers: [
        TranslateService,
        DialogService,
        DialogRef,
        {
          provide: DialogConfig,
          useValue: {
            data: {
              areas: [],
            }
          }
        }
      ],
      declarations: [ SelectIntersectionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectIntersectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
