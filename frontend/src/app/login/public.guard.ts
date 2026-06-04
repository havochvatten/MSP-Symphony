import { environment } from '@src/environments/environment';
import { inject, Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectPublicAccess } from '@data/systemproperties/systemproperties.selectors';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PublicGuard implements CanActivate {
  private store = inject(Store);
  private router = inject(Router);

  canActivate(): Observable<boolean | UrlTree> {
    return this.store.select(selectPublicAccess).pipe(
      take(1),
      map((publicAccess) => {
        console.log('publicAccess in canAcativate(): ', publicAccess);
        if (!publicAccess) {
          this.router.navigate(['/login']); // Redirect
        }
        return publicAccess; // Return boolean (true/false)
      })
    );
  }
}
