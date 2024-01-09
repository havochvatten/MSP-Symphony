import { ChartData } from "@src/app/report/pressure-chart/pressure-chart.component";
import { BandTypes, LayerData } from "@data/metadata/metadata.interfaces";
import { cloneDeep } from "lodash";
import { Report } from "@data/calculation/calculation.interfaces";

export function relativeDifference(a: any, b: any) {
  const na = a as number,
    nb = b as number,
    numeric_zero_diff = typeof a === 'number' && typeof b === 'number' && nb === 0 && na === 0;
  return numeric_zero_diff ? 0 : (nb - na) / na;
}

export function formatChartData(
    data: ChartData,
    bandDict: { [bandType: string]: { [p: string]: string } }): ChartData {

  const changeName = (node: any) => {
    try {
      const bands = bandDict[(node.name[0] as 'b' | 'e') === 'e' ? 'ECOSYSTEM' : 'PRESSURE'];
      const name = bands[Number(node.name.slice(1))];
      return {
        ...node,
        name
      };
    } catch (error) {
      return { ...node };
    }
  };

  // Needed to make the object extensible
  const _data = cloneDeep(data);
  return {
    ..._data,
    nodes: _data.nodes.map(changeName)
  };
}

export function bandTitlesWithOverflow(report: Report, bandDictionary: { [bandType: string]: { [p: string]: string } }): string[]  {
  if(report.overflow === null) return [];

  const bandTitles: string[] = [];

  for (const t in BandTypes) {
    const bandType = BandTypes[t];
    const bandNumbers = report.overflow !== null && report.overflow[bandType] ? report.overflow[bandType] : [];
    for (const bandNumber of bandNumbers) {
      const bandTitle = bandDictionary[bandType][bandNumber.toString()];
      if (bandTitle) {
        bandTitles.push(bandTitle);
      }
    }
  }

  return bandTitles;
}
