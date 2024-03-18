import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeLanguageDialogComponent } from './change-language-dialog.component';
import { DialogRef } from "@shared/dialog/dialog-ref";
import { TranslateModule } from "@ngx-translate/core";

describe('ChangeLanguageDialogComponent', () => {
  let component: ChangeLanguageDialogComponent;
  let fixture: ComponentFixture<ChangeLanguageDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChangeLanguageDialogComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        {
          provide: DialogRef,
          useValue: {}
        }
      ]
    });
    fixture = TestBed.createComponent(ChangeLanguageDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
