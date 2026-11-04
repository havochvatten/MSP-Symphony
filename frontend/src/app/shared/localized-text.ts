/** Text keyed by language code, e.g. { sv: 'Sverige', en: 'Sweden' }. */
export type LocalizedText = Partial<Record<string, string>>;

export interface LocalizedTextResult {
  value: string;
  error?: string;
}

const expectedFormat = '{ "<lang>": "<text>" }';

export function resolveLocalizedText(
  text: LocalizedText | null | undefined,
  language: string | undefined,
  fallbackLanguage: string | undefined
): LocalizedTextResult {
  if (text === undefined || text === null) {
    return { value: '' };
  }
  if (typeof text !== 'object' || Array.isArray(text)) {
    return {
      value: '',
      error: `Localized text must be an object like ${expectedFormat}, got ${JSON.stringify(text)}`
    };
  }
  if (language !== undefined && typeof text[language] === 'string') {
    return { value: text[language] };
  }
  if (fallbackLanguage !== undefined && typeof text[fallbackLanguage] === 'string') {
    return { value: text[fallbackLanguage] };
  }
  return {
    value: '',
    error: `Localized text has no entry for language "${language}" or fallback "${fallbackLanguage}" `
      + `(expected ${expectedFormat}): ${JSON.stringify(text)}`
  };
}
