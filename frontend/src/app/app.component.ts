import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Event, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { findBestLanguageMatch, supportedLanguages } from "@src/app/app-translation-setup.module";

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

    const languageToUse = findBestLanguageMatch(supportedLanguages);
    if (languageToUse) {
      this.translate.use(languageToUse);
    }
  }
  ngOnDestroy() {
    if (this.routeDataSubscription) {
      this.routeDataSubscription.unsubscribe();
    }
  }
}
