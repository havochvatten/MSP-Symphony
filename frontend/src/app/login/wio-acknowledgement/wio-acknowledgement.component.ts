import { Component } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: 'app-wio-acknowledgement',
  templateUrl: './wio-acknowledgement.component.html',
  styleUrls: ['./wio-acknowledgement.component.scss']
})
export class WioAcknowledgementComponent {

  constructor( private translate : TranslateService ) { }

  swedish_locale() {
    return this.translate.currentLang === 'sv';
  }
}
