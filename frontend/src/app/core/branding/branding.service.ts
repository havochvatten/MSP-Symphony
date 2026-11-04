import { firstValueFrom } from 'rxjs';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@src/environments/environment';
import { LocalizedText } from '@shared/localized-text';

const defaultLoginLogoSrc = 'assets/long-tailed-duck.svg';

export interface BrandingConfig {
  flagAlt?: LocalizedText;
  flagSrc?: string;
  footerTextTranslationKey?: string;
  loginLogoAlt?: LocalizedText;
  loginLogoSrc?: string;
  logoAlt?: LocalizedText;
  logoSrc?: string;
  reportCountryLogoAlt?: LocalizedText;
  reportCountryLogoSrc?: string;
  reportLogoAlt?: LocalizedText;
  reportLogoSrc?: string;
  showLogos: boolean;
  showReportClosingMatter: boolean;
}

@Injectable({ providedIn: 'root' })
export class BrandingService {
  private http = inject(HttpClient);

  private config: BrandingConfig = {
    flagAlt: undefined,
    flagSrc: undefined,
    footerTextTranslationKey: undefined,
    loginLogoAlt: { en: 'Long-tailed duck', sv: 'Alfågel', fr: 'Harelde boréale' },
    loginLogoSrc: defaultLoginLogoSrc,
    logoAlt: { en: 'Symphony' },
    logoSrc: undefined,
    reportCountryLogoAlt: undefined,
    reportCountryLogoSrc: undefined,
    reportLogoAlt: undefined,
    reportLogoSrc: undefined,
    showLogos: false,
    showReportClosingMatter: false,
  };

  loadConfig(): Promise<void> {
    const fileName = environment.brandingFile || 'branding.json';

    return firstValueFrom(this.http.get<BrandingConfig>(`/assets/config/${fileName}`))
      .then((cfg) => {
        this.config = { ...this.config, ...cfg };
        // The default alt text describes the default duck, not a custom login logo
        if (cfg.loginLogoSrc && cfg.loginLogoSrc !== defaultLoginLogoSrc && cfg.loginLogoAlt === undefined) {
          this.config.loginLogoAlt = undefined;
        }
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
