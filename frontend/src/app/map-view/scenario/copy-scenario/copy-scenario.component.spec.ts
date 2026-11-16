import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogService } from '@shared/dialog/dialog.service';
import { DialogRef } from '@shared/dialog/dialog-ref';
import { DialogConfig } from '@shared/dialog/dialog-config';
import { TranslateService } from '@ngx-translate/core';
import { TranslateSpecModule } from '@src/testing/translate-spec.module';
import { CopyScenarioComponent } from './copy-scenario.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { provideZonelessChangeDetection } from '@angular/core';

describe('CopyScenarioComponent', () => {
  let component: CopyScenarioComponent;
  let fixture: ComponentFixture<CopyScenarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatFormFieldModule, MatCheckboxModule, TranslateSpecModule],
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
        },
        provideZonelessChangeDetection()
      ],
      declarations: [CopyScenarioComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CopyScenarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
