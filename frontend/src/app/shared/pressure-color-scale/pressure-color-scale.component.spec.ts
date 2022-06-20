import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PressureColorScaleComponent } from './pressure-color-scale.component';

function setUp() {
  const fixture: ComponentFixture<PressureColorScaleComponent> = TestBed.createComponent(PressureColorScaleComponent);
  const component: PressureColorScaleComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('PressureColorScaleComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PressureColorScaleComponent ]
    })
    .compileComponents();
  }));

  it('should create', () => {
    const { component } = setUp();
    expect(component).toBeTruthy();
  });
});
