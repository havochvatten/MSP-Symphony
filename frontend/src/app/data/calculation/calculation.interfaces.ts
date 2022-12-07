import { ChartData } from '@src/app/report/pressure-chart/pressure-chart.component';
import { Extent } from 'ol/extent';
import { ProjectionLike } from "ol/proj";
import { NormalizationOptions, NormalizationType } from "@data/calculation/calculation.service";
import { BandType } from "@data/metadata/metadata.interfaces";
import { GeoJSONFeatureCollection } from "ol/format/GeoJSON";

// TODO Move calculation element to Scenario state
export interface State {
  loadingReport: boolean;
  calculations: CalculationSlice[];
  loadingCalculations: boolean;
  calculating: boolean;
  legends: LegendState;
  percentileValue: number;
}

export interface Report {
  baselineName: string;
  operationName: string;
  operationOptions: OperationParams;
  name: string;
  total: number;
  average: number;
  min: number;
  max: number;
  stddev: number;
  histogram: number[];
  geographicalArea: number; // m^2
  calculatedPixels: number;
  gridResolution: number; // [m]
  matrix: DefaultMatrixData | string;
  altMatrix: boolean;
  normalization: NormalizationOptions;
  impactPerPressure: Record<number, number>;
  impactPerEcoComponent: Record<number, number>;
  scenarioChanges: GeoJSONFeatureCollection;
  chartData: ChartData;
  timestamp: number;
}

export interface ComparisonReport {
  a: Report,
  b: Report
}

export interface DefaultMatrixData {
  defaultMatrix: string,
  areaTypes: AreaTypes;
}

export interface AreaTypes {
  [key: string]: string[];
}

export interface ScenarioChange {
  areaName: string;
  band: number;
  multiplier: number;
  offset: number;
  roi: any;
  type: BandType;
}

export interface StaticImageOptions {
  url: string;
  imageExtent: Extent;
  projection: ProjectionLike
}

export interface CalculationSlice {
  name: string;
  // The below are set upon calculation completion
  id: string;
  timestamp: number;
  loading?: boolean;
}

export type LegendType = 'result' | 'ecosystem' | 'pressure';

export interface LegendColor {
  color: string;
  quantity: number;
  opacity?: number;
}

export interface Legend {
  unit: string;
  colorMap: LegendColor[];
}

export interface PercentileResponse {
  percentileValue: number;
}

export type LegendState = {
  [key in LegendType]: Legend | undefined;
};

export interface OperationParams {
  [param: string]: string;
}
