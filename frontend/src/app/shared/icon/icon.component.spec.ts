import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { IconComponent } from './icon.component';

function setUp() {
  const fixture: ComponentFixture<IconComponent> = TestBed.createComponent(IconComponent);
  const component: IconComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('IconComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [IconComponent]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = setUp();
    expect(component).toBeTruthy();
  });
});
