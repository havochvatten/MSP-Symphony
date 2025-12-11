/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
// TODO: rework approach to dialog rendering

import { Injector, Type, InjectionToken } from '@angular/core';

export class DialogInjector implements Injector {
  constructor(
    private parentInjector: Injector,
    private additionalTokens: WeakMap<any, any>
  ) {}

  get<T>(
    token: Type<T> | InjectionToken<T>,
    notFoundValue?: T
  ): T;

  get(token: any, notFoundValue?: any): any;

  get(token: any, notFoundValue?: any) {
    const value = this.additionalTokens.get(token);
    if (value) {
      return value;
    }
    return this.parentInjector.get<any>(token, notFoundValue);
  }
}
