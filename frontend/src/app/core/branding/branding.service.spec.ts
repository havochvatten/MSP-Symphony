import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { BrandingConfig, BrandingService } from './branding.service';

describe('BrandingService', () => {
  let service: BrandingService;
  let http: HttpTestingController;

  const load = async (cfg: Partial<BrandingConfig>) => {
    const loaded = service.loadConfig();
    http.expectOne(req => req.url.startsWith('/assets/config/')).flush(cfg);
    await loaded;
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideZonelessChangeDetection()]
    });
    service = TestBed.inject(BrandingService);
    http = TestBed.inject(HttpTestingController);
    spyOn(console, 'info');
  });

  it('keeps the default login logo alt text with the default login logo', async () => {
    await load({ loginLogoSrc: 'assets/long-tailed-duck.svg' });
    expect(service.configData.loginLogoAlt).toEqual({ en: 'Long-tailed duck', sv: 'Alfågel', fr: 'Harelde boréale' });
  });

  it('does not give a custom login logo the default login logo alt text', async () => {
    await load({ loginLogoSrc: 'assets/branding/our-org/logo.svg' });
    expect(service.configData.loginLogoAlt).toBeUndefined();
  });

  it('uses the configured alt text for a custom login logo', async () => {
    await load({ loginLogoSrc: 'assets/branding/our-org/logo.svg', loginLogoAlt: { en: 'Our logo' } });
    expect(service.configData.loginLogoAlt).toEqual({ en: 'Our logo' });
  });
});
