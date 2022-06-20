import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckboxGroupComponent } from './checkbox-group.component';
import { HavCheckboxModule } from 'hav-components';
import { IconComponent } from '../icon/icon.component';

function setUp() {
  const fixture: ComponentFixture<CheckboxGroupComponent> = TestBed.createComponent(CheckboxGroupComponent);
  const component: CheckboxGroupComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('CheckboxGroupComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HavCheckboxModule],
      declarations: [CheckboxGroupComponent, IconComponent]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = setUp();
    expect(component).toBeTruthy();
  });
});
