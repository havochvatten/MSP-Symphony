import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment as env } from '@src/environments/environment';


const BASE_URL = env.apiBaseUrl;

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private apiUrl = `${BASE_URL}/categories`;

  constructor(private http: HttpClient) {}

  getCategories(): Observable<{ id: number; name: string }[]> {
    return this.http.get<{ id: number; name: string }[]>(this.apiUrl);
  }

  createCategory(name: string): Observable<{ id: number; name: string }> {
    return this.http.post<{ id: number; name: string }>(this.apiUrl, { name });
  }
}
