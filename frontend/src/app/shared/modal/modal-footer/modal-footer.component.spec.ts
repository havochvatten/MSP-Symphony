import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalFooterComponent } from './modal-footer.component';
import { provideZonelessChangeDetection } from "@angular/core";

describe('ModalFooterComponent', () => {
  let fixture: ComponentFixture<ModalFooterComponent>,
      component: ModalFooterComponent;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
      declarations: [ModalFooterComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(ModalFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
