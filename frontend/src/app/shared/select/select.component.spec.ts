import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SelectComponent } from './select.component';
import { IconComponent } from '../icon/icon.component';

describe('SelectComponent', () => {
  let fixture: ComponentFixture<SelectComponent>,
      component: SelectComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SelectComponent, IconComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(SelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
