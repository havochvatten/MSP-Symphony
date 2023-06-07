import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ComparisonReport, Report } from "@data/calculation/calculation.interfaces";
import { environment as env } from "@src/environments/environment";

@Injectable({
  providedIn: 'root'
})
export class
ReportService {
  constructor(private http: HttpClient) {}

  public getReport(id: string) {
    return this.http.get<Report>(`${env.apiBaseUrl}/report/${id}`);
  }

  public getComparisonReport(aId: string, bId: string) {
    return this.http.get<ComparisonReport>(`${env.apiBaseUrl}/report/comparison/${aId}/${bId}`);
  }

  public calculateArea(report: Report) {
    if (report.calculatedPixels && report.gridResolution)
      return report.calculatedPixels*report.gridResolution*report.gridResolution; // Unit: m2
    else
      return report.geographicalArea;
  }

  public setAreaDict(report: Report): Map<number, string> {

    const areaDict = new Map<number, string>();
    const index_ids = Object.keys(report.scenarioChanges.areaChanges);

    index_ids.map((areaId, ix) => {
      areaDict.set(+areaId, report.areaMatrices[ix].areaName);
    });

    return areaDict;
  }
}
