import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconButtonComponent } from './icon-button.component';
import { IconComponent } from '../icon/icon.component';
import { provideZonelessChangeDetection } from "@angular/core";

describe('IconButtonComponent', () => {
  let fixture: ComponentFixture<IconButtonComponent>,
      component: IconButtonComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection()
      ],
      declarations: [IconButtonComponent, IconComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(IconButtonComponent);
    component = fixture.componentInstance;
    component.label = 'test label';
    component.icon = 'plus';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
