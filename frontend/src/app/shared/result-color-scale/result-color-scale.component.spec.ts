import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultColorScaleComponent } from './result-color-scale.component';

function setUp() {
  const fixture: ComponentFixture<ResultColorScaleComponent> = TestBed.createComponent(ResultColorScaleComponent);
  const component: ResultColorScaleComponent = fixture.componentInstance;
  return { fixture, component };
}

describe('ResultColorScaleComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResultColorScaleComponent ]
    })
    .compileComponents();
  }));

  it('should create', () => {
    const { component } = setUp();
    expect(component).toBeTruthy();
  });
});
