import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HighestImpactsComponent } from './highest-impacts.component';

function setUp() {
  const fixture: ComponentFixture<HighestImpactsComponent> = TestBed.createComponent(HighestImpactsComponent);
  const component: HighestImpactsComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('HighestImpactsComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HighestImpactsComponent ]
    })
    .compileComponents();
  }));

  it('should create', () => {
    const { component } = setUp();
    expect(component).toBeTruthy();
  });
});
