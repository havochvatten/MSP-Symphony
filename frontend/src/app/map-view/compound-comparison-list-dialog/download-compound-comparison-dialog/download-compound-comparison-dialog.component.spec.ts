import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadCompoundComparisonDialogComponent } from './download-compound-comparison-dialog.component';
import { DialogService } from "@shared/dialog/dialog.service";
import { DialogRef } from "@shared/dialog/dialog-ref";
import { DialogConfig } from "@shared/dialog/dialog-config";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { MatCheckboxModule } from "@angular/material/checkbox";

describe('DownloadCompoundComparisonDialogComponent', () => {
  let component: DownloadCompoundComparisonDialogComponent;
  let fixture: ComponentFixture<DownloadCompoundComparisonDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MatCheckboxModule,
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
        }
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
