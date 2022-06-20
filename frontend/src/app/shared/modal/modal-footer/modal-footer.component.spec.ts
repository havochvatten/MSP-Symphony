import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalFooterComponent } from './modal-footer.component';

function setUp() {
  const fixture: ComponentFixture<ModalFooterComponent> = TestBed.createComponent(ModalFooterComponent);
  const component: ModalFooterComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('ModalFooterComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ModalFooterComponent]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = setUp();
    expect(component).toBeTruthy();
  });
});
