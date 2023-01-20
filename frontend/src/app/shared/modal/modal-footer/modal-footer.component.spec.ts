import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ModalFooterComponent } from './modal-footer.component';

describe('ModalFooterComponent', () => {
  let fixture: ComponentFixture<ModalFooterComponent>,
      component: ModalFooterComponent;
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ModalFooterComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(ModalFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
