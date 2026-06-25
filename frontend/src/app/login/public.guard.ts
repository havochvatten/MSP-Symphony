import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectPublicAccess } from '@data/systemproperties/systemproperties.selectors';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { UserActions } from '@data/user';

@Injectable({
  providedIn: 'root'
})
export class PublicGuard implements CanActivate {
  private store = inject(Store);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    return this.store.select(selectPublicAccess).pipe(
      take(1),
      map((publicAccess) => {
        // Handle root path ('') redirect
        if (route.routeConfig?.path === '') {
          if (publicAccess) {
            return this.router.createUrlTree(['/public']);
          } else {
            return this.router.createUrlTree(['/map']);
          }
        }
        // Handle /public route access
        if (!publicAccess) {
          return this.router.createUrlTree(['/login']);
        }
        // Activating the public view: fetch the user so a logged-in visitor gets the
        // correct (logged-in) header. An anonymous 401 no longer redirects to /login
        // (handled in fetchUserFailure$).
        this.store.dispatch(UserActions.fetchUser());
        return publicAccess;
      })
    );
  }
}
