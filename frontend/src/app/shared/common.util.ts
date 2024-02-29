import { formatNumber } from "@angular/common";
export function formatPercentage(value: number, decimals: number, locale: string, ersatz?: string, relative = false) {
  return (Math.abs(value) === Infinity || isNaN(value)) ?
    ersatz ?? "" :
    (value > 0 && relative ? "+" : "") + formatNumber(value * 100, locale, '1.0-' + decimals) + "%";
}

export function textFilter(input: string, filter: string) {
  return input.toLowerCase().indexOf(filter.toLowerCase()) === -1;
}

export function size(collection: object) {
  return collection ? Object.keys(collection).length : 0;
}

export function isEmpty(o: object | never[] | null) {
  return !Object.entries(o || {}).length;
}

export function isEqual(a?: object, b?: object) {
  return JSON.stringify(a) === JSON.stringify(b);
}
