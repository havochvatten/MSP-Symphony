import { resolveLocalizedSrc } from './localized-src';

describe('resolveLocalizedSrc', () => {
  it('returns a plain path unchanged for every language', () => {
    expect(resolveLocalizedSrc('a.svg', 'sv', 'en')).toEqual({ value: 'a.svg' });
    expect(resolveLocalizedSrc('a.svg', 'fr', 'en')).toEqual({ value: 'a.svg' });
  });

  it('picks the path for the current language', () => {
    expect(resolveLocalizedSrc({ sv: 'sv.svg', en: 'en.svg' }, 'sv', 'en').value).toBe('sv.svg');
  });

  it('falls back to the default language when the current one is missing', () => {
    expect(resolveLocalizedSrc({ sv: 'sv.svg', en: 'en.svg' }, 'fr', 'en').value).toBe('en.svg');
  });

  it('resolves to an empty path with an error when neither language is present', () => {
    const result = resolveLocalizedSrc({ sv: 'sv.svg' }, 'fr', 'en');
    expect(result.value).toBe('');
    expect(result.error).toBeDefined();
  });

  it('resolves a missing path to an empty path without an error', () => {
    expect(resolveLocalizedSrc(undefined, 'sv', 'en')).toEqual({ value: '' });
  });
});
