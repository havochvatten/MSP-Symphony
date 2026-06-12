import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from '@src/app/app-reducer';
import { MessageSelectors, MessageActions } from '@data/message';
import { Message } from '@data/message/message.interfaces';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-popup-message',
  templateUrl: './popup-message.component.html',
  styleUrls: ['./popup-message.component.scss'],
  standalone: false
})
export class PopupMessageComponent implements OnInit, OnDestroy {
  private readonly store = inject<Store<State>>(Store);

  messages: Message[] = [];
  isHtmlRx = /<(?:.|\n)*?>/;
  private messageSubscription$?: Subscription;

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
