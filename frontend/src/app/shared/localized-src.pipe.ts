import { ChangeDetectorRef, DestroyRef, Pipe, PipeTransform, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { LocalizedSrc, resolveLocalizedSrc } from './localized-src';

/**
 * Picks the image path for the selected language, falling back to the default language.
 * Returns '' when nothing resolves, so templates can guard with `@if (x | localizedSrc; as src)`.
 * Impure, and marks its view for check on language change, since the app is zoneless.
 */
@Pipe({ name: 'localizedSrc', pure: false, standalone: false })
export class LocalizedSrcPipe implements PipeTransform {
  private translate = inject(TranslateService);
  private reportedErrors = new Set<string>();

  constructor() {
    const cdr = inject(ChangeDetectorRef);
    this.translate.onLangChange
      .pipe(takeUntilDestroyed(inject(DestroyRef)))
      .subscribe(() => cdr.markForCheck());
  }

  transform(src: LocalizedSrc | null | undefined): string {
    const { value, error } = resolveLocalizedSrc(
      src,
      this.translate.currentLang,
      this.translate.getDefaultLang()
    );
    if (error && !this.reportedErrors.has(error)) {
      this.reportedErrors.add(error);
      console.error(error);
    }
    return value;
  }
}
