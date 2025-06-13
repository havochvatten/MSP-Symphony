import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment as env } from '@src/environments/environment';
import { AreaInterfaces } from './';
import { UserArea, NationalArea } from './area.interfaces';

const BASE_URL = env.apiBaseUrl;

@Injectable({
  providedIn: 'root'
})
export default class AreaService {
  constructor(private http: HttpClient) {}

  getNationalAreaTypes() {
    return this.http.get<string[]>(`${BASE_URL}/areas`);
  }

  getNationalAreasData(areaType: string) {
    return this.http.get<NationalArea>(`${BASE_URL}/areas/${areaType}`);
  }

  getUserAreas() {
    return this.http.get<AreaInterfaces.UserArea[]>(`${BASE_URL}/user/area/all`);
  }

  createUserArea(userArea: Partial<UserArea>) {
    return this.http.post<AreaInterfaces.UserArea>(`${BASE_URL}/user/area`, userArea);
  }

  uploadUserArea(formData: FormData) {
    return this.http.post<AreaInterfaces.UploadedUserDefinedArea>(`${BASE_URL}/user/area/import`,
      formData);
  }

  confirmUserAreaImport(key: string) {
    return this.http.put<AreaInterfaces.AreaImport>(`${BASE_URL}/user/area/import/${key}`, null);
  }

  updateUserArea(userArea: Partial<UserArea>) {
    return this.http.put<AreaInterfaces.UserArea>(`${BASE_URL}/user/area/${userArea.id}`, userArea
    );
  }

  deleteUserArea(userAreaId: number) {
    return this.http.delete(`${BASE_URL}/user/area/${userAreaId}`);
  }

  deletemultipleUserAreas(userAreaIds: number[]) {
    return this.http.delete(`${BASE_URL}/user/area?ids=${userAreaIds.join()}`);
  }

  getBoundaries() {
    return this.http.get<{ areas: AreaInterfaces.Boundary[] }>(`${BASE_URL}/areas/boundary`
    );
  }

  getCalibratedCalculationAreas(baselineName: string) {
    return this.http.get<AreaInterfaces.CalculationAreaSlice[]>(`${BASE_URL}/calculationarea/calibrated/${baselineName}`)
  }
}
