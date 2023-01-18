import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CheckboxGroupComponent } from './checkbox-group.component';
import { IconComponent } from '../icon/icon.component';

function setUp() {
  const fixture: ComponentFixture<CheckboxGroupComponent> = TestBed.createComponent(CheckboxGroupComponent);
  const component: CheckboxGroupComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('CheckboxGroupComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CheckboxGroupComponent, IconComponent]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = setUp();
    expect(component).toBeTruthy();
  });
});
