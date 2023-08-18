import { ChartData } from "@src/app/report/pressure-chart/pressure-chart.component";
import { LayerData } from "@data/metadata/metadata.interfaces";
import { cloneDeep } from "lodash";
import { BandMap } from "@src/app/report/calculation-report.component";

export function relativeDifference(a: any, b: any) {
  const na = a as number,
    nb = b as number,
    numeric_zero_diff = typeof a === 'number' && typeof b === 'number' && nb === 0 && na === 0;
  return numeric_zero_diff ? 0 : (nb - na) / na;
}

export function formatChartData(data: ChartData, metadata: LayerData, bandMap: BandMap) {
  if (!metadata.ecoComponent.length || !data) return undefined;

  const changeName = (node: any) => {
    try {
      const bands = bandMap[node.name[0] as 'b' | 'e'];
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
