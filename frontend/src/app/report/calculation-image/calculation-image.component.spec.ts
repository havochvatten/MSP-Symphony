import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CalculationImageComponent } from './calculation-image.component';

function setUp() {
  const fixture: ComponentFixture<CalculationImageComponent> = TestBed.createComponent(
    CalculationImageComponent
  );
  const component: CalculationImageComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('CalculationImageComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CalculationImageComponent]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = setUp();
    expect(component).toBeTruthy();
  });
});
