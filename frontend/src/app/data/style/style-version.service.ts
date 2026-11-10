import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { environment as env } from '@src/environments/environment';

/**
 * Version of the map styles on the server. Map image URLs carry it, so browsers fetch new images after a
 * style changes instead of showing year-cached ones drawn with the old colours.
 */
@Injectable({
  providedIn: 'root'
})
export class StyleVersionService {
  private readonly http = inject(HttpClient);

  private readonly version$: Observable<string> = this.http
    .get<{ version: string }>(`${env.apiBaseUrl}/legend/style-version`)
    .pipe(
      map((response) => response.version ?? ''),
      // Shares a fetched version; a failed request is not kept, so the next image asks again
      shareReplay(1),
      // Images must still load without a version, for example if the request is refused
      catchError(() => of(''))
    );

  public getVersion(): Observable<string> {
    return this.version$;
  }
}
