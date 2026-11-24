import { Component, inject } from '@angular/core';
import { BrandingConfig, BrandingService } from '@src/app/core/branding/branding.service';

/** The country logo and the agency logo in the top right corner of a report, for the selected language. */
@Component({
  selector: 'app-report-logos',
  templateUrl: './report-logos.component.html',
  styleUrls: ['./report-logos.component.scss'],
  standalone: false
})
export class ReportLogosComponent {
  private readonly brandingService = inject(BrandingService);

  protected get config(): BrandingConfig {
    return this.brandingService.configData;
  }
}
