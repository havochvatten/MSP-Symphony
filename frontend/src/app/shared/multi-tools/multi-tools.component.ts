import { Component, Input, WritableSignal } from '@angular/core';
import { IconType } from "@shared/icon/icon.component";

@Component({
  selector: 'app-multi-tools',
  templateUrl: './multi-tools.component.html',
  styleUrls: ['./multi-tools.component.scss']
})
export class MultiToolsComponent {

  @Input() isMultiMode!: WritableSignal<boolean>
  @Input() modeChangeEffect: (() => void | undefined) | undefined;
  @Input() disabledPredicate!: () => boolean
  @Input() exitLabel!: string
  @Input() enterLabel!: string
  @Input() multiActionDelegate!: () => Promise<void>
  @Input() multiActionLabel!: string
  @Input() multiActionLabelDisabled!: string
  @Input() multiActionIcon!: IconType;

  toggleMultiMode() {
    this.isMultiMode.update((v) => !v);

    if(this.modeChangeEffect) {
      this.modeChangeEffect();
    }
  }

}
