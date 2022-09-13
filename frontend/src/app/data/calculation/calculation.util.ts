import { formatNumber } from "@angular/common";

export function relativeDifference(a: any, b: any) {
  const na = a as number,
        nb = b as number;
  return (nb - na) / na;
}
export function formatRelativePercentage(value: number, decimals : number, ersatz : string, locale : string){
  return (value === Infinity || isNaN(value)) ?
    ersatz :
    (value > 0 ? "+" : "") +  formatNumber(value * 100, locale, '1.0-' + decimals) + "%";
}
