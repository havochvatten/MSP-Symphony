import { Component, inject, OnDestroy } from '@angular/core';
import { ActivatedRoute, Event, NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators';

import { State } from './app-reducer';
import { UserSelectors } from '@data/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false
})
export class AppComponent implements OnDestroy {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly store = inject<Store<State>>(Store);

  headerTitle = '';
  isInitialLoading$: Observable<boolean>;
  routeDataSubscription: Subscription | undefined;

  constructor() {
    this.isInitialLoading$ = this.store.select(UserSelectors.selectIsInitialLoading);

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
        mergeMap((route) => route.data)
      )
      .subscribe((data) => {
        this.headerTitle = data['headerTitle'] ? data['headerTitle'] : '';
      });
  }

  ngOnDestroy() {
    if (this.routeDataSubscription) {
      this.routeDataSubscription.unsubscribe();
    }
  }
}
