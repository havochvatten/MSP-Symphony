import { Component, AfterContentInit, ContentChildren, QueryList, Input, EventEmitter, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TabComponent } from './tab/tab.component';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  standalone: false
})
export class TabsComponent implements AfterContentInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  @ContentChildren(TabComponent) tabs!: QueryList<TabComponent>;
  @Input() routeTabIdIsAvailable = false;
  tabSelected = new EventEmitter<string>();

  ngAfterContentInit() {
    const tabId = this.getRouteTabId();
    const firstTab = this.tabs.first;
    const firstTabId = firstTab ? firstTab.id : undefined;
    this.selectTab(tabId === null ? firstTabId : tabId);
  }

  selectTab(tabId?: string) {
    // set selected tab as active and the rest as not active
    this.tabs.toArray().forEach(tab => (tab.active = tab.id === tabId));
    if (tabId && this.getRouteTabId() !== tabId) {
      this.navigateToURL(tabId);
    }
  }

  navigateToURL = (tabId: string) => {
    if (this.routeTabIdIsAvailable) {
      this.router.navigate([tabId], { relativeTo: this.route });
      this.tabSelected.emit(tabId);
    }
  };

  getRouteTabId = () => this.route.snapshot.paramMap.get('tabId');
}
