import { Component, AfterContentInit, ContentChildren, QueryList, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TabComponent } from './tab/tab.component';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class TabsComponent implements AfterContentInit {
  @ContentChildren(TabComponent) tabs!: QueryList<TabComponent>;
  @Input() routeTabIdIsAvailable = false;

  constructor(private router: Router, private route: ActivatedRoute) {}

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
    }
  };

  getRouteTabId = () => this.route.snapshot.paramMap.get('tabId');
}
