import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconComponent } from './icon.component';
import { provideZonelessChangeDetection } from "@angular/core";

describe('IconComponent', () => {
  let fixture: ComponentFixture<IconComponent>,
      component: IconComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ provideZonelessChangeDetection() ],
      declarations: [IconComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(IconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
