import { AfterContentInit, Component, ContentChildren, Input, QueryList, WritableSignal } from '@angular/core';
import { MultiActionButtonComponent } from "@shared/multi-action-button/multi-action-button.component";

@Component({
  selector: 'app-multi-tools',
  templateUrl: './multi-tools.component.html',
  styleUrls: ['./multi-tools.component.scss']
})
export class MultiToolsComponent implements AfterContentInit {

  @ContentChildren(MultiActionButtonComponent) actionButtons?: QueryList<MultiActionButtonComponent>;

  @Input() isMultiMode!: WritableSignal<boolean>
  @Input() modeChangeEffect: (() => void) | undefined;
  @Input() disabledPredicate!: () => boolean
  @Input() exitLabel!: string
  @Input() enterLabel!: string

  ngAfterContentInit() {
    this.actionButtons!.forEach((actionButton) => {
      if(actionButton.disabledPredicate === undefined) {
        actionButton.disabledPredicate = this.disabledPredicate;
      }
      actionButton.isMultiMode = this.isMultiMode;
    });
  }

  toggleMultiMode() {
    this.isMultiMode.update((v) => !v);

    if(this.modeChangeEffect) {
      this.modeChangeEffect();
    }
  }

}
