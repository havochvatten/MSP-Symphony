export const supportedLanguages = ['en', 'sv', 'fr'];

export const defaultLanguage = 'en';

export function findBestLanguageMatch(setLocale?: string): string {
  const userLanguage = setLocale ?? navigator.language?.slice(0, 2);
  return typeof userLanguage !== 'undefined' && supportedLanguages.includes(userLanguage)
    ? userLanguage
    : defaultLanguage;
}
