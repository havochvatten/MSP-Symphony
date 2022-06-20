import { TranslateService } from "@ngx-translate/core";

export type BandMap = Record<'b' | 'e', Record<number, string>>;

export class ReportComponent  {
  locale = 'en';

  constructor(
    protected translate: TranslateService,
  ) {
    this.locale = this.translate.currentLang;
  }
}
