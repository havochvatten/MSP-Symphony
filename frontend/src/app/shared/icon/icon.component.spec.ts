import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IconComponent } from './icon.component';

function setUp() {
  const fixture: ComponentFixture<IconComponent> = TestBed.createComponent(IconComponent);
  const component: IconComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('IconComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IconComponent]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = setUp();
    expect(component).toBeTruthy();
  });
});
