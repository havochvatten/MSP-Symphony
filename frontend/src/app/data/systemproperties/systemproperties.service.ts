import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { catchError, Observable, of, shareReplay, tap } from 'rxjs';
import { loadConfigSuccess, loadConfigFailure } from './systemproperties.actions';
import { environment as env } from '@src/environments/environment';
import { AppConfig } from './systemproperties.interfaces';

@Injectable({
  providedIn: 'root' // Singleton service
})
export class ConfigService {
  private readonly http = inject(HttpClient);
  private readonly configUrl = `${env.apiBaseUrl}/systemproperties`;
  private config$: Observable<AppConfig> | null = null;

  constructor(private readonly store: Store) {}

  loadConfig(): Observable<AppConfig> {
    this.config$ ??= this.http.get<AppConfig>(this.configUrl).pipe(
      tap((config) => {
        this.store.dispatch(loadConfigSuccess({ config }));
      }),
      catchError((error) => {
        console.error('Failed to load config:', error);
        this.store.dispatch(loadConfigFailure({ error: error.message }));
        return of({ publicAccess: false });
      }),
      shareReplay(1) // Cache the latest value for all subscribers
    );
    return this.config$;
  }
}
