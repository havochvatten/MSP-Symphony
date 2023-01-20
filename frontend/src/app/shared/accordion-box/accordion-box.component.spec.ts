import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AccordionBoxComponent } from './accordion-box.component';
import { IconButtonComponent } from '../icon-button/icon-button.component';
import { IconComponent } from '../icon/icon.component';

describe('AccordionBoxComponent', () => {
  let fixture: ComponentFixture<AccordionBoxComponent>,
      component: AccordionBoxComponent;

  beforeEach(waitForAsync(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccordionBoxComponent, IconButtonComponent, IconComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccordionBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
