import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { State } from '../app-reducer';
import { UserSelectors, UserActions } from '@data/user';
import { Observable, of } from 'rxjs';
import { tap, take, switchMap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationGuard implements CanActivate {
  constructor(private store: Store<State>) {}

  getFromStoreOrAPI(): Observable<any> {
    return this.store.select(UserSelectors.selectIsLoggedIn).pipe(
      tap((isLoggedIn: boolean) => {
        if (!isLoggedIn) {
          this.store.dispatch(UserActions.fetchUser());
        }
      }),
      take(1)
    );
  }

  canActivate = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> =>
    this.checkLogin(state.url);

  checkLogin = (url: string): Observable<boolean> => {
    this.store.dispatch(UserActions.updateRedirectUrl({ url }));
    return this.getFromStoreOrAPI().pipe(
      switchMap(() => of(true)),
      catchError(error => of(false))
    );
  };
}
