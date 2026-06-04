import { Directive, ElementRef, OnInit } from '@angular/core';

@Directive({ selector: '[appAutoSelect]', standalone: false })
export class AutoSelectDirective implements OnInit {
  constructor(private el: ElementRef<HTMLInputElement>) {}

  ngOnInit() {
    // Defer past Angular's current change detection pass so the browser
    // has painted the element before we attempt focus + select.
    setTimeout(() => {
      this.el.nativeElement.focus();
      this.el.nativeElement.select();
    });
  }
}
