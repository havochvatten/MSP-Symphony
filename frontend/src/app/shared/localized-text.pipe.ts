import { ChangeDetectorRef, DestroyRef, Pipe, PipeTransform, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { LocalizedText, resolveLocalizedText } from './localized-text';

/**
 * Picks the text for the selected language, falling back to the default language.
 * Impure, and marks its view for check on language change, since the app is zoneless.
 */
@Pipe({ name: 'localizedText', pure: false, standalone: false })
export class LocalizedTextPipe implements PipeTransform {
  private translate = inject(TranslateService);
  private reportedErrors = new Set<string>();

  constructor() {
    const cdr = inject(ChangeDetectorRef);
    this.translate.onLangChange
      .pipe(takeUntilDestroyed(inject(DestroyRef)))
      .subscribe(() => cdr.markForCheck());
  }

  transform(text: LocalizedText | null | undefined): string {
    const { value, error } = resolveLocalizedText(
      text, this.translate.currentLang, this.translate.getDefaultLang());
    if (error && !this.reportedErrors.has(error)) {
      this.reportedErrors.add(error);
      console.error(error);
    }
    return value;
  }
}
