import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserInterfaces } from './';
import { environment as env } from '@src/environments/environment';
import { UserSettings } from "@data/user/user.interfaces";

const BASE_URL = env.apiBaseUrl;

@Injectable({
  providedIn: 'root'
})
export default class UserService {
  constructor(private http: HttpClient) {}

  login(username: string, password: string) {
    return this.http.post<UserInterfaces.User>(`${BASE_URL}/login`, { username, password });
  }

  logout() {
    return this.http.post(`${BASE_URL}/logout`, {});
  }

  fetchUser() {
    return this.http.get<UserInterfaces.User>(`${BASE_URL}/getuser`);
  }

  fetchBaseline() {
    return this.http.get<UserInterfaces.Baseline>(env.baseline
      ? `${BASE_URL}/baselineversion/name/${env.baseline}`
      : `${BASE_URL}/baselineversion/current`);
  }

  updateSettings(param: UserSettings) {
    return this.http.put<UserSettings>(`${BASE_URL}/user/settings`, param);
  }
}
