import { LocalizedText, resolveLocalizedText } from './localized-text';

describe('resolveLocalizedText', () => {
  const text: LocalizedText = { sv: 'Sverige', en: 'Sweden' };

  it('returns the text for the current language', () => {
    const result = resolveLocalizedText(text, 'sv', 'en');
    expect(result.value).toBe('Sverige');
    expect(result.error).toBeUndefined();
  });

  it('falls back to the fallback language', () => {
    const result = resolveLocalizedText(text, 'fr', 'en');
    expect(result.value).toBe('Sweden');
    expect(result.error).toBeUndefined();
  });

  it('falls back when the current language is not set yet', () => {
    expect(resolveLocalizedText(text, undefined, 'en').value).toBe('Sweden');
  });

  it('keeps a deliberate empty string instead of falling back', () => {
    const result = resolveLocalizedText({ sv: '', en: 'Sweden' }, 'sv', 'en');
    expect(result.value).toBe('');
    expect(result.error).toBeUndefined();
  });

  it('returns an empty string without error when not configured', () => {
    expect(resolveLocalizedText(undefined, 'sv', 'en')).toEqual({ value: '' });
    expect(resolveLocalizedText(null, 'sv', 'en')).toEqual({ value: '' });
  });

  it('reports an old-format plain string', () => {
    const result = resolveLocalizedText('Sverige' as unknown as LocalizedText, 'sv', 'en');
    expect(result.value).toBe('');
    expect(result.error).toContain('{ "<lang>": "<text>" }');
  });

  it('reports an array as the wrong format', () => {
    const result = resolveLocalizedText(['Sverige'] as unknown as LocalizedText, 'sv', 'en');
    expect(result.value).toBe('');
    expect(result.error).toContain('{ "<lang>": "<text>" }');
  });

  it('reports a text missing both the language and the fallback', () => {
    const result = resolveLocalizedText({ sv: 'Sverige' }, 'fr', 'en');
    expect(result.value).toBe('');
    expect(result.error).toContain('"fr"');
    expect(result.error).toContain('"en"');
    expect(result.error).toContain('Sverige');
  });
});
