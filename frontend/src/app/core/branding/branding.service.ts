import { firstValueFrom } from 'rxjs';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@src/environments/environment';

export interface BrandingConfig {
  flagAlt: string | null;
  flagSrc: string | null;
  footerTextTranslationKey: string | null;
  loginLogoAlt: string | null;
  loginLogoSrc: string | null;
  logoAlt: string | null;
  logoSrc: string | null;
  reportCountryLogoAlt: string | null;
  reportCountryLogoSrc: string | null;
  reportLogoAlt: string | null;
  reportLogoSrc: string | null;
  showLogos: boolean;
  showReportClosingMatter: boolean;
}

@Injectable({ providedIn: 'root' })
export class BrandingService {
  private http = inject(HttpClient);

  private config: BrandingConfig = {
    flagAlt: null,
    flagSrc: null,
    footerTextTranslationKey: null,
    loginLogoAlt: 'Symphony',
    loginLogoSrc: null,
    logoAlt: 'Symphony',
    logoSrc: null,
    reportCountryLogoAlt: null,
    reportCountryLogoSrc: null,
    reportLogoAlt: 'Symphony',
    reportLogoSrc: null,
    showLogos: false,
    showReportClosingMatter: false,
  };

  loadConfig(): Promise<void> {
    const fileName = environment.brandingFile || 'branding.json';

    return firstValueFrom(this.http.get<BrandingConfig>(`/assets/config/${fileName}`))
      .then((cfg) => {
        this.config = { ...this.config, ...cfg };
        console.info(`✅ Loaded branding config from ${fileName}`);
      })
      .catch((error) => {
        console.error(`❌ Failed to load ${fileName}:`, error);
        console.warn('Using generic defaults');
      });
  }

  get configData(): BrandingConfig {
    return this.config;
  }
}
