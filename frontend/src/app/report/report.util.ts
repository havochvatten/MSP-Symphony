/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO: try to implement w/o `any` (presumably prohibited by the chart library)
import { ChartData } from "@src/app/report/pressure-chart/pressure-chart.component";
import { BandType, BandTypes } from "@data/metadata/metadata.interfaces";
import { cloneDeep } from "lodash";
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

export function setOverflowProperty(report: Report) {
  let allChanges: { [key: number]: { [key: string]: ChangesProperty } } = {};
  allChanges[0] = report.scenarioChanges.baseChanges;
  allChanges = { ...allChanges, ...report.scenarioChanges.areaChanges };

  // There's an argument to be made that this should be done in the backend.
  // Opting for this solution after having tried the other route, since it's
  // arguably (probably) a smaller and cheaper operation, to preprocess here.
  // Also keep in mind that we'll be looking to implement a more thorough
  // handling of the "overflow" phenomenon already in the subsequent release,
  // where this part is very likely to be changed anyway. Making substantial
  // changes that'd introduce complex behaviour to multiple entity classes and
  // dto's in the backend service, which are likewise subject to change in the
  // very short term, I feel is the less reasonable option at this point.

  for (const changes of Object.entries(allChanges)) {
    const index = +changes[0],
      changeRef = index === 0 ?
        report.scenarioChanges.baseChanges :
        report.scenarioChanges.areaChanges[+changes[0]];
    for (const change of Object.entries(changes[1])) {
      const bandType = change[0];
      for (const bandChange of Object.entries(change[1] as ChangesProperty)) {
        const positiveChange =
          (bandChange[1].offset && bandChange[1].offset > 0) ||
          (bandChange[1].multiplier && bandChange[1].multiplier > 1) || false;
        changeRef[bandType][bandChange[0]].hasOverflow =
          positiveChange &&
          report.overflow !== null &&
          report.overflow[bandType as BandType].includes(+bandChange[0]);
      }
    }
  }

  return report;
}
