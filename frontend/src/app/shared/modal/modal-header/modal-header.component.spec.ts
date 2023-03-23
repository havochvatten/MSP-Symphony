import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ModalHeaderComponent } from './modal-header.component';

describe('ModalHeaderComponent', () => {
  let fixture: ComponentFixture<ModalHeaderComponent>,
      component: ModalHeaderComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ModalHeaderComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(ModalHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
