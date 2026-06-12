import { Directive, ViewContainerRef, inject } from '@angular/core';

@Directive({
  selector: '[appInsertion]',
  standalone: false
})
export class InsertionDirective {
  viewContainerRef = inject(ViewContainerRef);
}
