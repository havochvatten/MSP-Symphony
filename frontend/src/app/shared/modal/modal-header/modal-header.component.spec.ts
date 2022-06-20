import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalHeaderComponent } from './modal-header.component';

function setUp() {
  const fixture: ComponentFixture<ModalHeaderComponent> = TestBed.createComponent(ModalHeaderComponent);
  const component: ModalHeaderComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('ModalHeaderComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ModalHeaderComponent]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = setUp();
    expect(component).toBeTruthy();
  });
});
