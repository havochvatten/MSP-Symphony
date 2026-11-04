import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeLanguageDialogComponent } from './change-language-dialog.component';
import { DialogRef } from "@shared/dialog/dialog-ref";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { MatRadioModule } from "@angular/material/radio";
import { provideZonelessChangeDetection } from "@angular/core";

describe('ChangeLanguageDialogComponent', () => {
  let component: ChangeLanguageDialogComponent;
  let fixture: ComponentFixture<ChangeLanguageDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChangeLanguageDialogComponent],
      imports: [TranslateModule.forRoot(), MatRadioModule],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: DialogRef,
          useValue: {}
        }
      ]
    });
    TestBed.inject(TranslateService).addLangs(['en', 'sv', 'fr']);
    fixture = TestBed.createComponent(ChangeLanguageDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('marks the flags as decorative, since the language name is shown next to them', () => {
    const flags: HTMLImageElement[] = Array.from(fixture.nativeElement.querySelectorAll('.language-flag img'));
    expect(flags.length).toBe(3);
    flags.forEach(img => expect(img.getAttribute('alt')).toBe(''));
  });
});
