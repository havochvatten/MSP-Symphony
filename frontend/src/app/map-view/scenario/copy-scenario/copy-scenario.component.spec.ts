import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogService } from "@shared/dialog/dialog.service";
import { DialogRef } from "@shared/dialog/dialog-ref";
import { DialogConfig } from '@shared/dialog/dialog-config';
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { CopyScenarioComponent } from './copy-scenario.component';

describe('CopyScenarioComponent', () => {
  let component: CopyScenarioComponent;
  let fixture: ComponentFixture<CopyScenarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
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
              scenario: {
                areas: []
              }
            }
          }
        }

      ],
      declarations: [ CopyScenarioComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CopyScenarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
