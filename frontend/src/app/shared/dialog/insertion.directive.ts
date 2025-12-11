import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appInsertion]',
  standalone: false
})
export class InsertionDirective {
  constructor(public viewContainerRef: ViewContainerRef) {}
}
