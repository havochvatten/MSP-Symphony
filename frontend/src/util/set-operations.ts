// Adapted from https://2ality.com/2015/01/es6-set-operations.html

export function intersection<T>(a: Set<T>, b: Set<T>): Set<T> {
  return new Set<T>([...a].filter(x => b.has(x)));
}

export function difference<T>(a: Set<T>, b: Set<T>): Set<T> {
  return new Set<T>([...a].filter(x => !b.has(x)));
}

// Not used, but for completion
export function union<T>(a: Set<T>, b: Set<T>): Set<T> {
  return new Set<T>([...a, ...b]);
}
