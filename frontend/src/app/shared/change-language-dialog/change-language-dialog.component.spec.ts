import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeLanguageDialogComponent } from './change-language-dialog.component';
import { DialogRef } from '@shared/dialog/dialog-ref';
import { TranslateService } from '@ngx-translate/core';
import { TranslateSpecModule } from '@src/testing/translate-spec.module';
import { MatRadioModule } from '@angular/material/radio';
import { provideZonelessChangeDetection } from '@angular/core';

describe('ChangeLanguageDialogComponent', () => {
  let component: ChangeLanguageDialogComponent;
  let fixture: ComponentFixture<ChangeLanguageDialogComponent>;
  let dialogRef: { close: jasmine.Spy };

  beforeEach(() => {
    dialogRef = { close: jasmine.createSpy('close') };
    TestBed.configureTestingModule({
      declarations: [ChangeLanguageDialogComponent],
      imports: [TranslateSpecModule, MatRadioModule],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: DialogRef,
          useValue: dialogRef
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
    const flags: HTMLImageElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.language-flag img')
    );
    expect(flags.length).toBe(3);
    flags.forEach((img) => expect(img.getAttribute('alt')).toBe(''));
  });

  it('returns the language the user clicked', () => {
    const radios: HTMLInputElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('mat-radio-button input')
    );
    const languages = component.languages;
    radios[languages.indexOf('sv')].click();
    fixture.detectChanges();

    component.apply();

    expect(dialogRef.close).toHaveBeenCalledOnceWith('sv');
  });
});
