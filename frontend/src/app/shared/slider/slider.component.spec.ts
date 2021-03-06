import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SliderComponent } from './slider.component';

function setUp() {
  const fixture: ComponentFixture<SliderComponent> = TestBed.createComponent(SliderComponent);
  const component: SliderComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('SliderComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SliderComponent]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = setUp();
    expect(component).toBeTruthy();
  });
});
