import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadCompoundComparisonDialogComponent } from './download-compound-comparison-dialog.component';
import { DialogService } from "@shared/dialog/dialog.service";
import { DialogRef } from "@shared/dialog/dialog-ref";
import { DialogConfig } from "@shared/dialog/dialog-config";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { provideZonelessChangeDetection } from "@angular/core";
import { MatRadioModule } from "@angular/material/radio";
import { FormsModule } from "@angular/forms";

describe('DownloadCompoundComparisonDialogComponent', () => {
  let component: DownloadCompoundComparisonDialogComponent;
  let fixture: ComponentFixture<DownloadCompoundComparisonDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MatRadioModule,
        MatCheckboxModule,
        FormsModule,
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
              comparisonName: 'test'
            }
          }
        },
        provideZonelessChangeDetection()
      ],
      declarations: [DownloadCompoundComparisonDialogComponent]
    });
    fixture = TestBed.createComponent(DownloadCompoundComparisonDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
