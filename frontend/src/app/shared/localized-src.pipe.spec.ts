import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LocalizedSrc } from './localized-src';
import { LocalizedSrcPipe } from './localized-src.pipe';

@Component({
  template: `@if (src | localizedSrc; as s) { <img [src]="s" alt=""> }`,
  standalone: false
})
class HostComponent {
  src: LocalizedSrc | undefined = { sv: 'sv.svg', en: 'en.svg' };
}

describe('LocalizedSrcPipe', () => {
  let fixture: ComponentFixture<HostComponent>;
  let translate: TranslateService;
  const img = (): HTMLImageElement | null => fixture.nativeElement.querySelector('img');

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [HostComponent, LocalizedSrcPipe],
      providers: [provideZonelessChangeDetection()]
    });
    translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('en');
    translate.use('sv');
    fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
  });

  it('renders the path for the current language', () => {
    expect(img()?.getAttribute('src')).toBe('sv.svg');
  });

  it('updates when the language changes at runtime', async () => {
    translate.use('fr');
    await fixture.whenStable();
    expect(img()?.getAttribute('src')).toBe('en.svg');

    translate.use('sv');
    await fixture.whenStable();
    expect(img()?.getAttribute('src')).toBe('sv.svg');
  });

  it('renders no image when no path resolves', async () => {
    fixture.componentInstance.src = { sv: 'sv.svg' };
    translate.use('fr');
    await fixture.whenStable();
    expect(img()).toBeNull();
  });

  it('logs an unresolvable path once', () => {
    spyOn(console, 'error');
    fixture.componentInstance.src = { sv: 'sv.svg' };
    translate.use('fr');
    fixture.detectChanges();
    fixture.detectChanges();
    expect(console.error).toHaveBeenCalledTimes(1);
  });
});
