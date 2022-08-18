import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment as env } from '@src/environments/environment';
import { AreaInterfaces } from './';
import { UserArea, NationalArea } from './area.interfaces';

const BASE_URL = env.apiBaseUrl;
const COUNTRY_CODE = env.areas.countryCode;

@Injectable({
  providedIn: 'root'
})
export default class AreaService {
  constructor(private http: HttpClient) {}

  getNationalAreaTypes() {
    return this.http.get<string[]>(`${BASE_URL}/nationalarea/${COUNTRY_CODE}`);
  }

  getNationalAreasData(areaType: string) {
    return this.http.get<NationalArea>(`${BASE_URL}/nationalarea/${COUNTRY_CODE}/${areaType}`);
  }

  getUserAreas() {
    return this.http.get<AreaInterfaces.UserArea[]>(`${BASE_URL}/userdefinedarea`);
  }

  createUserArea(userArea: Partial<UserArea>) {
    return this.http.post<AreaInterfaces.UserArea>(`${BASE_URL}/userdefinedarea`, userArea);
  }

  uploadUserArea(formData: FormData) {
    return this.http.post<AreaInterfaces.UploadedUserDefinedArea>(`${BASE_URL}/userdefinedarea/import`,
      formData);
  }

  confirmUserAreaImport(key: string, areaName: string) {
    return this.http.put<AreaInterfaces.UserArea>(`${BASE_URL}/userdefinedarea/import/${key}`,
      areaName);
  }

  updateUserArea(userArea: Partial<UserArea>) {
    return this.http.put<AreaInterfaces.UserArea>(
      `${BASE_URL}/userdefinedarea/${userArea.id}`,
      userArea
    );
  }

  deleteUserArea(userAreaId: number) {
    return this.http.delete(`${BASE_URL}/userdefinedarea/${userAreaId}`);
  }

  getBoundaries() {
    return this.http.get<{ areas: AreaInterfaces.Boundary[] }>(
      `${BASE_URL}/nationalarea/boundary/${COUNTRY_CODE}`
    );
  }
}
