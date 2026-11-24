import { LocalizedText, LocalizedTextResult, resolveLocalizedText } from './localized-text';

/** An image path used in every language, or one path per language code, e.g. { sv: 'sv.svg', en: 'en.svg' }. */
export type LocalizedSrc = string | LocalizedText;

export function resolveLocalizedSrc(
  src: LocalizedSrc | null | undefined,
  language: string | undefined,
  fallbackLanguage: string | undefined
): LocalizedTextResult {
  if (typeof src === 'string') {
    return { value: src };
  }
  return resolveLocalizedText(src, language, fallbackLanguage);
}
