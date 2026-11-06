import { uniqueScenarioName } from './unique-scenario-name';

describe('uniqueScenarioName', () => {
  it('returns the base name when it is free', () =>
    expect(uniqueScenarioName('Scenario Kattegatt', ['Scenario Skagerrak'])).toBe('Scenario Kattegatt'));

  it('returns the base name when the list is empty', () =>
    expect(uniqueScenarioName('Untitled scenario', [])).toBe('Untitled scenario'));

  it('appends 2 when the base name is taken', () =>
    expect(uniqueScenarioName('Scenario Kattegatt', ['Scenario Kattegatt'])).toBe('Scenario Kattegatt 2'));

  it('appends the next free number', () =>
    expect(uniqueScenarioName('Untitled scenario', ['Untitled scenario', 'Untitled scenario 2']))
      .toBe('Untitled scenario 3'));

  it('uses the first free number when there is a gap', () =>
    expect(uniqueScenarioName('Scenario X', ['Scenario X', 'Scenario X 3'])).toBe('Scenario X 2'));

  it('treats names as taken regardless of case and surrounding whitespace', () =>
    expect(uniqueScenarioName('Scenario Kattegatt', ['  scenario KATTEGATT '])).toBe('Scenario Kattegatt 2'));

  it('does not parse trailing numbers in the base name', () =>
    expect(uniqueScenarioName('Scenario Area 2', ['Scenario Area 2'])).toBe('Scenario Area 2 2'));

  it('trims the base name', () =>
    expect(uniqueScenarioName(' Scenario X ', [])).toBe('Scenario X'));

  it('trims the base name before adding a number', () =>
    expect(uniqueScenarioName('Scenario Kattegatt ', ['Scenario Kattegatt', 'Scenario Kattegatt 2']))
      .toBe('Scenario Kattegatt 3'));
});
