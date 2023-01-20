import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CheckboxGroupComponent } from './checkbox-group.component';
import { IconComponent } from '../icon/icon.component';

describe('CheckboxGroupComponent', () => {
  let fixture: ComponentFixture<CheckboxGroupComponent>,
      component: CheckboxGroupComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CheckboxGroupComponent, IconComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(CheckboxGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
