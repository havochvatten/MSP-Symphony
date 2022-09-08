import { Component, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Event, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  headerTitle = '';
  routeDataSubscription: Subscription | undefined;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private translate: TranslateService
  ) {
    this.routeDataSubscription = this.router.events
      .pipe(
        filter((e: Event) => e instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map((route: ActivatedRoute) => {
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        mergeMap(route => route.data)
      )
      .subscribe(data => {
        this.headerTitle = data.hasOwnProperty('headerTitle') ? data.headerTitle : '';
      });
    this.setLanguage();
  }

  private setLanguage() {
    const supportedLanguages = ['en', 'sv', 'fr']; /* TODO: Generalize */
    const browserLanguages = navigator.languages
      .map(lang => lang.split('-')[0])
      .filter(lang => supportedLanguages.includes(lang));
    if (browserLanguages) {
      this.translate.use(browserLanguages[0]);
    }
  }

  ngOnDestroy() {
    if (this.routeDataSubscription) {
      this.routeDataSubscription.unsubscribe();
    }
  }
}
