import { Pipe, PipeTransform } from "@angular/core";

@Pipe({name: 'ordinal'})
export class OrdinalPipe implements PipeTransform {
  transform(value: number, locale: string): string {
    const lang = locale.substr(0,2);

    // Concise approach found at https://stackoverflow.com/a/39466341
    return lang === 'sv' || 'se' ?
              value + (['a', 'a', 'e'][((value + 90) % 100 - 10) % 10 - 1] || 'e') :
           lang === 'fr' ?
              value + (value === 1 ? 'er' : 'e') :
           // default to English locale
              value + (['st', 'nd', 'rd'][((value + 90) % 100 - 10) % 10 - 1] || 'th');
  }
}
