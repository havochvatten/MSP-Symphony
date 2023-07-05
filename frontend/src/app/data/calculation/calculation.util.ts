import { formatNumber } from "@angular/common";
import { CalcOperation } from "@data/calculation/calculation.service";

export function relativeDifference(a: any, b: any) {
  const na = a as number,
        nb = b as number,
        numeric_zero_diff = typeof a === 'number' && typeof b === 'number' && nb === 0 && na === 0;
  return numeric_zero_diff ? 0 : (nb - na) / na;
}
export function formatPercentage(value: number, decimals : number, locale : string, ersatz? : string, relative = false){
  return (Math.abs(value) === Infinity || isNaN(value)) ?
    ersatz ?? "" :
    (value > 0 && relative ? "+" : "") +  formatNumber(value * 100, locale, '1.0-' + decimals) + "%";
}

export const availableOperations: Map<string, CalcOperation> = new Map<string, CalcOperation>(
  [ ['CumulativeImpact', CalcOperation.Cumulative ] ,
    ['RarityAdjustedCumulativeImpact', CalcOperation.RarityAdjusted ]]);

export const availableOperationsByValue: Map<CalcOperation, string> = new Map<CalcOperation, string>(
  [ [CalcOperation.Cumulative, 'CumulativeImpact' ] ,
    [CalcOperation.RarityAdjusted, 'RarityAdjustedCumulativeImpact' ]]);
