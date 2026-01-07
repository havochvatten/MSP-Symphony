import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalContentComponent } from './modal-content.component';
import { provideZonelessChangeDetection } from "@angular/core";


describe('ModalContentComponent', () => {
  let fixture: ComponentFixture<ModalContentComponent>,
      component: ModalContentComponent

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
      declarations: [ModalContentComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(ModalContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
