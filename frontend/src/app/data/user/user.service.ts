import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserInterfaces } from './';
import { environment as env } from '@src/environments/environment';
import { UserSettings } from '@data/user/user.interfaces';

const BASE_URL = env.apiBaseUrl;

@Injectable({
  providedIn: 'root'
})
export default class UserService {
  private readonly http = inject(HttpClient);

  login(username: string, password: string) {
    return this.http.post<UserInterfaces.User>(`${BASE_URL}/login`, { username, password });
  }

  logout() {
    return this.http.post(`${BASE_URL}/logout`, {});
  }

  fetchUser() {
    return this.http.get<UserInterfaces.User>(`${BASE_URL}/getuser`);
  }

  fetchCurrentBaseline() {
    return this.http.get<UserInterfaces.Baseline>(`${BASE_URL}/baselineversion/current`);
  }

  fetchBaseline() {
    return this.http.get<UserInterfaces.Baseline>(
      env.baseline
        ? `${BASE_URL}/baselineversion/name/${env.baseline}`
        : `${BASE_URL}/baselineversion/active`
    );
  }

  fetchBaselines() {
    return this.http.get<UserInterfaces.Baseline[]>(`${BASE_URL}/baselineversion`);
  }

  updateSettings(param: UserSettings) {
    return this.http.put<UserSettings>(`${BASE_URL}/user/settings`, param);
  }
}
