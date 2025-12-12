import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectComponent } from './select.component';
import { IconComponent } from '../icon/icon.component';
import { provideZonelessChangeDetection } from "@angular/core";

describe('SelectComponent', () => {
  let fixture: ComponentFixture<SelectComponent>,
      component: SelectComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
      declarations: [SelectComponent, IconComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(SelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
