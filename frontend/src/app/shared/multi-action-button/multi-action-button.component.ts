import { Component, Input, WritableSignal } from '@angular/core';
import { IconType } from "@shared/icon/icon.component";

@Component({
  selector: 'app-multi-action-button',
  templateUrl: './multi-action-button.component.html',
  styleUrls: ['./multi-action-button.component.scss']
})
export class MultiActionButtonComponent {
  @Input() multiActionLabel!: string
  @Input() multiActionLabelDisabled!: string
  @Input() multiActionIcon!: IconType;
  @Input() multiActionDelegate!: () => Promise<void>
  @Input() disabledPredicate!: () => boolean;
  @Input() isMultiMode!: WritableSignal<boolean>;
}
