import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CheckboxAccordionComponent } from './checkbox-accordion.component';
import {
  AccordionBoxComponent,
  AccordionBoxHeaderComponent,
  AccordionBoxContentComponent
} from '../../../shared/accordion-box/accordion-box.component';
import { IconButtonComponent } from '../../../shared/icon-button/icon-button.component';
import { IconComponent } from '../../../shared/icon/icon.component';

function setUp() {
  const fixture: ComponentFixture<CheckboxAccordionComponent> = TestBed.createComponent(CheckboxAccordionComponent);
  const component: CheckboxAccordionComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('CheckboxAccordionComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        CheckboxAccordionComponent,
        AccordionBoxComponent,
        AccordionBoxHeaderComponent,
        AccordionBoxContentComponent,
        IconButtonComponent,
        IconComponent
      ]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = setUp();
    expect(component).toBeTruthy();
  });
});
