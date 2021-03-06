import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalContentComponent } from './modal-content.component';

function setUp() {
  const fixture: ComponentFixture<ModalContentComponent> = TestBed.createComponent(ModalContentComponent);
  const component: ModalContentComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('ModalContentComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ModalContentComponent]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = setUp();
    expect(component).toBeTruthy();
  });
});
