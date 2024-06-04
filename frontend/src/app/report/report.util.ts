/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO: try to implement w/o `any` (presumably prohibited by the chart library)
import { ChartData } from "@src/app/report/pressure-chart/pressure-chart.component";
import { BandType, BandTypes } from "@data/metadata/metadata.interfaces";
import { Report } from "@data/calculation/calculation.interfaces";
import { ChangesProperty } from "@data/scenario/scenario.interfaces";

export function relativeDifference(a: unknown, b: unknown) {
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
  const _data = structuredClone(data);
  return {
    ..._data,
    nodes: _data.nodes.map(changeName)
  };
}
