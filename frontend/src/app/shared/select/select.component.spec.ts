import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SelectComponent } from './select.component';
import { IconComponent } from '../icon/icon.component';

function setUp() {
  const fixture: ComponentFixture<SelectComponent> = TestBed.createComponent(SelectComponent);
  const component: SelectComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('SelectComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SelectComponent, IconComponent]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = setUp();
    expect(component).toBeTruthy();
  });
});
