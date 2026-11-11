import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { provideZonelessChangeDetection } from '@angular/core';

import { FundingDisclaimerComponent } from './funding-disclaimer.component';

describe('FundingDisclaimerComponent', () => {
  let fixture: ComponentFixture<FundingDisclaimerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [FundingDisclaimerComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
    fixture = TestBed.createComponent(FundingDisclaimerComponent);
  });

  const render = async (lang: string): Promise<string[]> => {
    const translate = TestBed.inject(TranslateService);
    const translations = await (await fetch(`assets/i18n/${lang}.json`)).json();
    translate.setTranslation(lang, translations);
    translate.use(lang);
    fixture.detectChanges();
    await fixture.whenStable();
    return Array.from(fixture.nativeElement.querySelectorAll('p') as NodeListOf<HTMLElement>).map(
      (p) => p.textContent!.trim()
    );
  };

  it('renders the three Swedish paragraphs verbatim', async () => {
    const p = await render('sv');
    expect(p.length).toBe(3);
    expect(p[0]).toMatch(/^Denna kod har publicerats av Havs- och vattenmyndigheten \(HaV\)/);
    expect(p[1]).toContain('användningar – inklusive, men inte begränsat till – beslut');
    expect(p[2]).toBe(
      'Innehåll, resultat och användningar återspeglar inte nödvändigtvis varken Havs- och vattenmyndighetens, Regeringskansliets eller Sidas.'
    );
  });

  it('renders the English paragraphs', async () => {
    const p = await render('en');
    expect(p[0]).toMatch(/^This code was published by SwAM/);
    expect(p[2]).toBe(
      'The content, outputs and uses do not necessarily reflect those of neither SwAM, the Government Offices of Sweden nor Sida.'
    );
  });

  it('leaves no margin below the last paragraph, so the space after the block matches the space before it', async () => {
    document.body.appendChild(fixture.nativeElement);
    const paragraphs = await render('en');
    const last = fixture.nativeElement.querySelectorAll('p')[paragraphs.length - 1];
    expect(getComputedStyle(last).marginBottom).toBe('0px');
    fixture.nativeElement.remove();
  });

  it('renders the English text in the French UI', async () => {
    // A non-English fallback, so English text in fr can only come from fr.json itself
    TestBed.inject(TranslateService).setDefaultLang('sv');
    const en = await render('en');
    const fr = await render('fr');
    expect(fr).toEqual(en);
  });
});
