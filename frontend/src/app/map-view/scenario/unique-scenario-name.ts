const normalize = (name: string) => name.trim().toLowerCase();

/**
 * Returns the trimmed `baseName`, or the trimmed `baseName` followed by the first free
 * number from 2 upwards, so that the result does not match any of `existingNames`
 * (ignoring case and surrounding whitespace).
 */
export function uniqueScenarioName(untrimmedBaseName: string, existingNames: string[]): string {
  const baseName = untrimmedBaseName.trim();
  const taken = new Set(existingNames.map(normalize));
  if (!taken.has(normalize(baseName))) {
    return baseName;
  }
  let n = 2;
  while (taken.has(normalize(`${baseName} ${n}`))) {
    n++;
  }
  return `${baseName} ${n}`;
}
