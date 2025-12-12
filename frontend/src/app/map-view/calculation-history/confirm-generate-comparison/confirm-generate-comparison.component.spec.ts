import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmGenerateComparisonComponent } from './confirm-generate-comparison.component';
import { DialogRef } from "@shared/dialog/dialog-ref";
import { TranslateModule } from "@ngx-translate/core";
import { provideZonelessChangeDetection } from "@angular/core";
import { FormsModule } from "@angular/forms";

describe('ConfirmGenerateComparisonComponent', () => {
  let component: ConfirmGenerateComparisonComponent;
  let fixture: ComponentFixture<ConfirmGenerateComparisonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        FormsModule
      ],
      providers: [
        provideZonelessChangeDetection(),
        TranslateModule,
        {
          provide: DialogRef,
          useValue: {}
        }
      ],
      declarations: [ConfirmGenerateComparisonComponent]
    });
    fixture = TestBed.createComponent(ConfirmGenerateComparisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
