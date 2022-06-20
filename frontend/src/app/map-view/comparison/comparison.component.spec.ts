import { ComponentFixture, TestBed } from "@angular/core/testing";
import {ComparisonComponent} from "@src/app/map-view/comparison/comparison.component";

function setUp() {
  const fixture: ComponentFixture<ComparisonComponent> = TestBed.createComponent(ComparisonComponent);
  const component: ComparisonComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('ComparisonComponent', () => {
  it('should create', () => {
    const { component } = setUp();
    expect(component).toBeTruthy();
  });
});
