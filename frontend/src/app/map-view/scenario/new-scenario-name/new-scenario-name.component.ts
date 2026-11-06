import {
  AfterViewInit, Component, DOCUMENT, ElementRef, HostListener, OnDestroy, ViewChild, computed, inject, signal
} from '@angular/core';
import { DialogRef } from '@shared/dialog/dialog-ref';
import { DialogConfig } from '@shared/dialog/dialog-config';

export interface NewScenarioNameData { suggestedName: string }

/** Asks for the name of a new scenario. Closes with the trimmed name, or null when cancelled. */
@Component({
  selector: 'app-new-scenario-name',
  templateUrl: './new-scenario-name.component.html',
  styleUrls: ['./new-scenario-name.component.scss'],
  standalone: false
})
export class NewScenarioNameComponent implements AfterViewInit, OnDestroy {
  private readonly dialog = inject(DialogRef);
  private readonly conf = inject<DialogConfig<NewScenarioNameData>>(DialogConfig);
  /** Whatever had focus when the dialog opened (normally the + button), so focus can go back there. */
  private readonly opener = inject(DOCUMENT).activeElement as HTMLElement | null;

  @ViewChild('nameInput') nameInput!: ElementRef<HTMLInputElement>;

  readonly name = signal(this.conf.data?.suggestedName ?? '');
  readonly isBlank = computed(() => this.name().trim() === '');

  ngAfterViewInit() {
    const input = this.nameInput.nativeElement;
    input.focus();
    input.select();
  }

  ngOnDestroy() {
    if (this.opener?.isConnected) {
      this.opener.focus();
    }
  }

  create() {
    if (!this.isBlank()) {
      this.dialog.close(this.name().trim());
    }
  }

  @HostListener('document:keydown.escape')
  cancel() {
    this.dialog.close(null);
  }
}
