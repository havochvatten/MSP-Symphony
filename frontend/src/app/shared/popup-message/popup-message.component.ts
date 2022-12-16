import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from '@src/app/app-reducer';
import { MessageSelectors, MessageActions } from '@data/message';
import { Message } from '@data/message/message.interfaces';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-popup-message',
  templateUrl: './popup-message.component.html',
  styleUrls: ['./popup-message.component.scss']
})
export class PopupMessageComponent implements OnInit, OnDestroy {
  messages: Message[] = [];
  isHtmlRx = /<(?:.|\n)*?>/;
  private messageSubscription$?: Subscription;

  constructor(private store: Store<State>) {}

  ngOnInit() {
    this.messageSubscription$ = this.store
      .select(MessageSelectors.selectPopups)
      .subscribe(messages => {
        this.messages = messages;
      });
  }

  isHtml(s: string): boolean {
    return this.isHtmlRx.test(s);
  }

  removeMessage(uuid: string) {
    this.store.dispatch(MessageActions.removePopupMessage({ uuid }));
  }

  ngOnDestroy() {
    if (this.messageSubscription$) {
      this.messageSubscription$.unsubscribe();
    }
  }
}
