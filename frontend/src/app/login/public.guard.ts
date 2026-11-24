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
        // Resolve the current user so PublicView can decide where to send them: a
        // logged-in visitor is redirected to /map, an anonymous visitor (401) gets the
        // public user and stays here. The 401 no longer routes to /login here (that is
        // handled in fetchUserFailure$ only when public access is off).
        this.store.dispatch(UserActions.fetchUser());
        return publicAccess;
      })
    );
  }
}
