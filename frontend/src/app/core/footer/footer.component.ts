import { Component, inject } from '@angular/core';
import { BrandingService } from '@src/app/core/branding/branding.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: false
})
export class FooterComponent {
  public brandingService = inject(BrandingService);
}
