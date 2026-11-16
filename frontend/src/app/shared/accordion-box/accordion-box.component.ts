import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-accordion-box',
  templateUrl: './accordion-box.component.html',
  styleUrls: ['./accordion-box.component.scss'],
  standalone: false
})
export class AccordionBoxComponent {
  @Input() open = false;
  /** Shows the on-map bar on the left edge. Off by default. */
  @Input() marked = false;
  @Input() toggle: () => void = () => (this.open = !this.open);

  onToggle() {
    this.toggle();
  }
}

@Component({
  selector: 'app-accordion-box-header',
  template: `<ng-content></ng-content>`,
  standalone: false
})
export class AccordionBoxHeaderComponent {}

@Component({
  selector: 'app-accordion-box-content',
  template: `<ng-content></ng-content>`,
  standalone: false
})
export class AccordionBoxContentComponent {}
