import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ToggleComponent } from './toggle.component';

function setUp() {
  const fixture: ComponentFixture<ToggleComponent> = TestBed.createComponent(ToggleComponent);
  const component: ToggleComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('ToggleComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ToggleComponent ]
    })
    .compileComponents();
  }));

  it('should create', () => {
    const { component } = setUp();
    expect(component).toBeTruthy();
  });
});
