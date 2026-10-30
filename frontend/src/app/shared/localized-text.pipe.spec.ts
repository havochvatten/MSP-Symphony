import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LocalizedText } from './localized-text';
import { LocalizedTextPipe } from './localized-text.pipe';

@Component({ template: `<img [alt]="text | localizedText">`, standalone: false })
class HostComponent {
  text: LocalizedText | undefined = { sv: 'Sverige', en: 'Sweden' };
}

describe('LocalizedTextPipe', () => {
  let fixture: ComponentFixture<HostComponent>;
  let translate: TranslateService;
  const alt = () => fixture.nativeElement.querySelector('img').getAttribute('alt');

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [HostComponent, LocalizedTextPipe],
      providers: [provideZonelessChangeDetection()]
    });
    translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('en');
    translate.use('sv');
    fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
  });

  it('renders the text for the current language', () => {
    expect(alt()).toBe('Sverige');
  });

  it('updates when the language changes at runtime', async () => {
    translate.use('fr');
    await fixture.whenStable();
    expect(alt()).toBe('Sweden');

    translate.use('sv');
    await fixture.whenStable();
    expect(alt()).toBe('Sverige');
  });

  it('renders an empty alt, never "undefined", when not configured', () => {
    fixture.componentInstance.text = undefined;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(alt()).toBe('');
  });

  it('logs a configuration error only once', () => {
    spyOn(console, 'error');
    fixture.componentInstance.text = { sv: 'Sverige' };
    translate.use('fr');
    fixture.detectChanges();
    fixture.detectChanges();
    fixture.detectChanges();
    expect(console.error).toHaveBeenCalledTimes(1);
  });
});
