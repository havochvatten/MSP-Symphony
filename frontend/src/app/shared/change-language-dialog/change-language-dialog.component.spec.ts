import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeLanguageDialogComponent } from './change-language-dialog.component';
import { DialogRef } from "@shared/dialog/dialog-ref";
import { TranslateModule } from "@ngx-translate/core";
import { provideZonelessChangeDetection } from "@angular/core";

describe('ChangeLanguageDialogComponent', () => {
  let component: ChangeLanguageDialogComponent;
  let fixture: ComponentFixture<ChangeLanguageDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChangeLanguageDialogComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        provideZonelessChangeDetection(),
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
