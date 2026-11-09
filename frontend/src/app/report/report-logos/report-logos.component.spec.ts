import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BrandingConfig, BrandingService } from '@src/app/core/branding/branding.service';
import { LocalizedSrcPipe } from '@shared/localized-src.pipe';
import { LocalizedTextPipe } from '@shared/localized-text.pipe';
import { ReportLogosComponent } from './report-logos.component';

describe('ReportLogosComponent', () => {
  let fixture: ComponentFixture<ReportLogosComponent>;
  let translate: TranslateService;
  let config: BrandingConfig;

  const countryLogo = (): HTMLImageElement | null =>
    fixture.nativeElement.querySelector('img.report-country-logo');
  const agencyLogo = (): HTMLImageElement | null =>
    fixture.nativeElement.querySelector('img.report-logo');
  const images = (): HTMLImageElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('img'));

  const render = async () => {
    fixture = TestBed.createComponent(ReportLogosComponent);
    await fixture.whenStable();
  };

  beforeEach(() => {
    config = {
      showLogos: true,
      showReportClosingMatter: false,
      reportCountryLogoSrc: 'se.svg',
      reportCountryLogoAlt: { sv: 'Sverige', en: 'Sweden' },
      reportLogoSrc: { sv: 'hav-sv.svg', en: 'hav-en.svg' },
      reportLogoAlt: { sv: 'Havs- och vattenmyndigheten', en: 'Swedish Agency for Marine and Water Management' }
    };
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [ReportLogosComponent, LocalizedSrcPipe, LocalizedTextPipe],
      providers: [
        { provide: BrandingService, useValue: { configData: config } },
        provideZonelessChangeDetection()
      ]
    });
    translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('en');
    translate.use('sv');
  });

  it('shows the country logo and the agency logo for the current language', async () => {
    await render();
    expect(countryLogo()?.getAttribute('src')).toBe('se.svg');
    expect(agencyLogo()?.getAttribute('src')).toBe('hav-sv.svg');
  });

  it('shows the English agency logo in French', async () => {
    translate.use('fr');
    await render();
    expect(agencyLogo()?.getAttribute('src')).toBe('hav-en.svg');
  });

  it('switches the agency logo when the language changes', async () => {
    await render();
    expect(agencyLogo()?.getAttribute('src')).toBe('hav-sv.svg');

    translate.use('en');
    await fixture.whenStable();
    expect(agencyLogo()?.getAttribute('src')).toBe('hav-en.svg');
  });

  it('shows no logos when showLogos is false', async () => {
    config.showLogos = false;
    await render();
    expect(images().length).toBe(0);
  });

  it('shows no logos when the agency logo does not resolve', async () => {
    spyOn(console, 'error');
    config.reportLogoSrc = { sv: 'x.svg' };
    translate.use('fr');
    await render();
    expect(images().length).toBe(0);
  });

  it('shows only the agency logo when there is no country logo', async () => {
    config.reportCountryLogoSrc = undefined;
    await render();
    expect(images().map(img => img.className)).toEqual(['report-logo']);
  });

  it('uses the configured alt texts', async () => {
    await render();
    expect(countryLogo()?.getAttribute('alt')).toBe('Sverige');
    expect(agencyLogo()?.getAttribute('alt')).toBe('Havs- och vattenmyndigheten');
  });
});
