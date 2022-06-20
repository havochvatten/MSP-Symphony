import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogComponent } from './dialog.component';

function setUp() {
  const fixture: ComponentFixture<DialogComponent> = TestBed.createComponent(DialogComponent);
  const component: DialogComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('DialogComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DialogComponent]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = setUp();
    expect(component).toBeTruthy();
  });
});
