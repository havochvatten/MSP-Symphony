import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmGenerateComparisonComponent } from './confirm-generate-comparison.component';
import { DialogRef } from "@shared/dialog/dialog-ref";
import { TranslateModule } from "@ngx-translate/core";

describe('ConfirmGenerateComparisonComponent', () => {
  let component: ConfirmGenerateComparisonComponent;
  let fixture: ComponentFixture<ConfirmGenerateComparisonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ TranslateModule.forRoot() ],
      providers: [
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
