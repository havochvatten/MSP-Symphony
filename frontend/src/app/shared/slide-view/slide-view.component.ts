import {
  Component,
  Input,
  Output,
  EventEmitter,
  QueryList,
  ContentChildren,
  OnChanges,
  AfterViewInit
} from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { IconType } from '@shared/icon/icon.component';
import { v4 as uuid } from 'uuid';
import { Observable } from 'rxjs/internal/Observable';
import {
  CompoundComparisonListDialogComponent
} from "@src/app/map-view/compound-comparison-list-dialog/compound-comparison-list-dialog.component";

const DEFAULT_TAB = 0;

@Component({
  selector: 'app-slide-view-tab',
  template: `
    <ng-content *ngIf="active"></ng-content>
  `
})
export class SlideViewTabComponent {
  @Input() title?: string;
  @Input() icon: IconType = 'info-circle';
  @Input() id: string = uuid();
  active = false;
}

type ViewOrientation = 'right' | 'left';

@Component({
  selector: 'app-slide-view',
  templateUrl: './slide-view.component.html',
  styleUrls: ['./slide-view.component.scss'],
  animations: [
    trigger('openClose', [
      state('open', style({ width: '40rem' })),
      state('closed', style({ width: '1.2rem' })),
      transition('closed => open', [animate('0.3s cubic-bezier(0.0, 0.0, 0.2, 0.1)')]),
      transition('open => closed', [animate('0.25s cubic-bezier(0.4, 0.0, 1, 1)')])
    ])
  ]
})
export class SlideViewComponent implements OnChanges, AfterViewInit {
  @Input() open = false;
  @Input() position: ViewOrientation = 'right';
  @Input() compoundComparisonCount$!: Observable<number>;
  @Output() toggle = new EventEmitter<void>();
  @Output() navigate = new EventEmitter<string>();
  @Output() openCCList = new EventEmitter<void>();
  @ContentChildren(SlideViewTabComponent) tabs!: QueryList<SlideViewTabComponent>;
  @Input() routeTabIdIsAvailable = false;

  constructor(
  ) {}

  ngAfterViewInit() {
    if (this.open) {
      // Needs to be here because of the change detection lifecycle.
      // It will wait to run until the next event loop.
      setTimeout(() => {
        this.tabs.toArray()[DEFAULT_TAB].active = true; // FIXME revert to 0 when merging branch
      }, 0);
    }
  }

  ngOnChanges() {
    if (!this.open && this.tabs) {
      this.tabs.toArray().forEach(tab => (tab.active = false));
    }
  }

  selectTab(tabId?: string) {
    if (this.tabs.toArray().filter(tab => tab.active).length === 0) {
      this.onClick();
    }
    this.tabs.toArray().forEach(tab => (tab.active = tab.id === tabId));
    this.navigate.emit(tabId);
  }

  onClick() {
    this.toggle.emit();
  }

  openCompoundComparisonList() {
    this.openCCList.emit();
  }
}
