import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ResultColorScaleComponent } from './result-color-scale.component';

function setUp() {
  const fixture: ComponentFixture<ResultColorScaleComponent> = TestBed.createComponent(ResultColorScaleComponent);
  const component: ResultColorScaleComponent = fixture.componentInstance;
  return { fixture, component };
}

describe('ResultColorScaleComponent', () => {
  beforeEach(waitForAsync(() => {
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
