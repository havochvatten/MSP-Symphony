import { createAction, props } from '@ngrx/store';
import { CalculationSlice, LegendType, Legend } from './calculation.interfaces';
import { ErrorMessage } from '@data/message/message.interfaces';

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

export const loadCalculation = createAction(
  '[Calculation] Load calculations',
  props<{calculation: CalculationSlice}>()
);

export const fetchLegend = createAction(
  '[Calculation] Fetch legend',
  props<{ legendType: LegendType }>()
);

export const fetchLegendSuccess = createAction(
  '[Calculation] Fetch legend success',
  props<{ legend: Legend, legendType: LegendType }>()
);

export const fetchLegendFailure = createAction(
  '[Calculation] Fetch legend failure',
  props<{ error: ErrorMessage }>()
);

export const updateName = createAction(
  '[Calculation] Update calculation name',
  props<{ index: number, newName: string }>()
);
