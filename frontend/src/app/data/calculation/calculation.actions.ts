import { createAction, props } from '@ngrx/store';
import {
  CalculationSlice,
  LegendType,
  Legend,
  PercentileResponse,
  BatchCalculationProcessEntry
} from './calculation.interfaces';
import { ErrorMessage } from '@data/message/message.interfaces';
import { SortActionProps } from "@data/common/sorting.interfaces";

export const startCalculation = createAction('[Calculation] Add calculation');

export const calculationSucceeded = createAction(
  '[Calculation] Calculation succeeded',
  props<{calculation: CalculationSlice }>()
);

export const calculationFailed = createAction('[Calculation] Calculation failed',);

export const fetchCalculations = createAction('[Calculation] Fetch previous calculations',);

export const fetchCalculationsSuccess = createAction(
  '[Calculation] Fetch calculations success',
  props<{ calculations: CalculationSlice[] }>()
);

export const fetchCalculationsFailure = createAction(
  '[Calculation] Fetch calculations failure',
  props<{ error: ErrorMessage }>()
);

export const fetchLegend = createAction(
  '[Calculation] Fetch legend',
  props<{ legendType: LegendType }>()
);

export const fetchComparisonLegend = createAction(
  '[Calculation] Fetch comparison legend',
  props<{ comparisonTitle: string }>()
);

export const fetchDynamicComparisonLegend = createAction(
  '[Calculation] Fetch dynamic comparison legend',
  props<{ dynamicMax: number, comparisonTitle: string }>()
);

export const fetchLegendSuccess = createAction(
  '[Calculation] Fetch legend success',
  props<{ legend: Legend, legendType: LegendType }>()
);

export const fetchComparisonLegendSuccess = createAction(
  '[Calculation] Fetch comparison legend success',
  props<{ legend: Legend, comparisonTitle: string, maxValue: number }>()
);

export const resetComparisonLegend = createAction(
    '[Calculation] Reset comparison legend'
);

export const fetchLegendFailure = createAction(
  '[Calculation] Fetch legend failure',
  props<{ error: ErrorMessage }>()
);

export const fetchPercentile = createAction(
  '[Calculation] Fetch percentile value used for normalization'
);

export const fetchPercentileSuccess = createAction(
  '[Calculation] Fetch percentile value success',
  props<PercentileResponse>()
);

export const fetchPercentileFailure = createAction(
  '[Calculation] Fetch percentile value',
  props<{ error: ErrorMessage }>()
);

export const deleteCalculation = createAction(
  '[Calculation] Delete calculation',
  props<{ calculationToBeDeleted: CalculationSlice }>()
)

export const deleteCalculationSuccess = createAction(
  '[Calculation] Delete calculation success'
);

export const deleteCalculationFailure = createAction(
  '[Calculation] Delete calculation failure',
  props<{ error: ErrorMessage }>()
);

export const updateName = createAction(
  '[Calculation] Update calculation name',
  props<{ index: number, newName: string }>()
);

export const setCalculationSortType = createAction(
  '[Calculation] Set calculation sort type',
  props<SortActionProps>()
);

export const updateBatchProcess = createAction(
  '[Calculation] Update batch process',
  props<{ id: number, process: BatchCalculationProcessEntry }>()
);

export const cancelBatchProcess = createAction(
  '[Calculation] Cancel batch process',
  props<{ id: number }>()
);

export const cancelBatchProcessSuccess = createAction(
    '[Calculation] Cancel batch process success',
    props<{ id: number }>()
);

export const removeFinishedBatchProcess = createAction(
  '[Calculation] Remove finished batch process',
  props<{ id: number }>()
);

export const removeBatchProcessSuccess = createAction(
  '[Calculation] Remove batch process success',
  props<{ id: number }>()
);

export const removeBatchProcessFailure = createAction(
  '[Calculation] Remove batch process failure',
  props<{ error: ErrorMessage }>()
);

export const setVisibleResultLayers = createAction(
  '[Calculation] Set visible result layers',
  props<{ visibleResults: number[] }>()
);
