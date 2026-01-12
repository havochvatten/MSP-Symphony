import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalHeaderComponent } from './modal-header.component';
import { provideZonelessChangeDetection } from "@angular/core";

describe('ModalHeaderComponent', () => {
  let fixture: ComponentFixture<ModalHeaderComponent>,
      component: ModalHeaderComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
      declarations: [ModalHeaderComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(ModalHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
