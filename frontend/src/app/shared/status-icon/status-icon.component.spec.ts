import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusIconComponent } from './status-icon.component';
import { provideZonelessChangeDetection } from "@angular/core";

describe('StatusIconComponent', () => {
  let fixture: ComponentFixture<StatusIconComponent>,
      component: StatusIconComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection()
      ],
      declarations: [ StatusIconComponent ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(StatusIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
