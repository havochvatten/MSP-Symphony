import { formatNumber } from "@angular/common";
import { BandChange } from "@data/metadata/metadata.interfaces";
import { convertMultiplierToPercent } from "@data/metadata/metadata.selectors";
export function formatPercentage(value: number, decimals: number, locale: string, ersatz?: string, relative = false) {
  return (Math.abs(value) === Infinity || isNaN(value)) ?
    ersatz ?? "" :
    (value > 0 && relative ? "+" : "") + formatNumber(value * 100, locale, '1.0-' + decimals) + "%";
}

export function textFilter(input: string, filter: string) {
  return input.toLowerCase().indexOf(filter.toLowerCase()) === -1;
}

export function size(collection: object | null) {
  return collection ? Object.keys(collection).length : 0;
}

export function isEmpty(o: object | never[] | null) {
  return !Object.entries(o || {}).length;
}

export function isEqual(a?: object, b?: object) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function changeText(bandName: string, change: BandChange) {
  return `${bandName}: ${change.multiplier ? (change.multiplier > 1 ? '+' : '') +
    Number(convertMultiplierToPercent(change.multiplier) * 100).toFixed(2) + '%' :
    change.offset! > 0 ? '+' + change.offset : change.offset
  }`;
}
