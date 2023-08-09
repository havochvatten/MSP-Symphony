import { formatNumber } from "@angular/common";

export function formatPercentage(value: number, decimals: number, locale: string, ersatz?: string, relative = false) {
  return (Math.abs(value) === Infinity || isNaN(value)) ?
    ersatz ?? "" :
    (value > 0 && relative ? "+" : "") + formatNumber(value * 100, locale, '1.0-' + decimals) + "%";
}
