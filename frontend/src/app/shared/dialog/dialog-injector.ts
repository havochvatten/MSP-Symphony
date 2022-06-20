import { Injector, Type, InjectionToken, InjectFlags } from '@angular/core';

export class DialogInjector implements Injector {
  constructor(
    private parentInjector: Injector,
    private additionalTokens: WeakMap<any, any>
  ) {}

  get<T>(
    token: Type<T> | InjectionToken<T>,
    notFoundValue?: T,
    flags?: InjectFlags
  ): T;

  get(token: any, notFoundValue?: any): any;

  get(token: any, notFoundValue?: any, flags?: any) {
    const value = this.additionalTokens.get(token);
    if (value) {
      return value;
    }
    return this.parentInjector.get<any>(token, notFoundValue);
  }
}
