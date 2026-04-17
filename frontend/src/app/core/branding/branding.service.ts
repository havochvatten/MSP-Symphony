import { firstValueFrom } from 'rxjs';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@src/environments/environment';

export interface BrandingConfig {
  appTitle: string;
  flagAlt: string;
  flagSrc: string;
  footerText: string;
  loginLogoAlt: string;
  loginLogoSrc: string;
  logoAlt: string;
  logoSrc: string;
  orgName: string;
  reportCountryLogoAlt: string;
  reportCountryLogoSrc: string;
  reportLogoAlt: string;
  reportLogoSrc: string;
  showLogos: boolean;
  showReportClosingMatter: boolean;
}

@Injectable({ providedIn: 'root' })
export class BrandingService {
  private http = inject(HttpClient);

  private config: BrandingConfig = {
    appTitle: 'Symphony – Ecosystem-based Marine Spatial Planning',
    flagAlt: '',
    flagSrc: '',
    footerText: 'Powered by Symphony',
    loginLogoAlt: 'Symphony',
    loginLogoSrc: '',
    logoAlt: 'Symphony',
    logoSrc: '',
    orgName: 'Symphony',
    reportCountryLogoAlt: '',
    reportCountryLogoSrc: '',
    reportLogoAlt: 'Symphony',
    reportLogoSrc: '',
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
