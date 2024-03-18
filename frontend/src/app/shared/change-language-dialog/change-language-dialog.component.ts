import { Component } from '@angular/core';
import { DialogRef } from "@shared/dialog/dialog-ref";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: 'app-change-language-dialog',
  templateUrl: './change-language-dialog.component.html',
  styleUrls: ['./change-language-dialog.component.scss']
})
export class ChangeLanguageDialogComponent {

  languages: string[] = ['en'];
  selectedLanguage = 'en';

  constructor( private dialog: DialogRef, translateService: TranslateService) {
    const browserLang = translateService.getBrowserLang();

    this.languages = translateService.getLangs();
    this.selectedLanguage = translateService.currentLang;

    if (browserLang && this.languages.includes(browserLang)) {
      // Move the browser language preference to the top of the list
      this.languages = [browserLang, ...this.languages.filter(lang => lang !== browserLang)];
    }
  }

  close() {
    this.dialog.close();
  }

  apply() {
    this.dialog.close(this.selectedLanguage);
  }
}
