import { environment } from '@src/environments/environment';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PublicGuard {
  router = inject(Router);

  canActivate = (): boolean => {
    if (environment.PUBLIC_VIEWER_OPEN) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  };
}
