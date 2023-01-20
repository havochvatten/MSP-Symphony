import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ModalContentComponent } from './modal-content.component';


describe('ModalContentComponent', () => {
  let fixture: ComponentFixture<ModalContentComponent>,
      component: ModalContentComponent

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ModalContentComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(ModalContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
