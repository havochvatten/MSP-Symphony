import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-accordion-box',
  templateUrl: './accordion-box.component.html',
  styleUrls: ['./accordion-box.component.scss']
})
export class AccordionBoxComponent {
  @Input() open = false;
  @Input() toggle: () => void = () => this.open = !this.open;

  onToggle() {
    this.toggle();
  }

}

@Component({
  selector: 'app-accordion-box-header',
  template: `<ng-content></ng-content>`
})
export class AccordionBoxHeaderComponent {}

@Component({
  selector: 'app-accordion-box-content',
  template: `<ng-content></ng-content>`
})
export class AccordionBoxContentComponent {}
