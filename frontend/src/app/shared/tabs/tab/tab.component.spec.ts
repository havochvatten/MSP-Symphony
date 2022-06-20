import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TabComponent } from './tab.component';

function setUp() {
  const fixture: ComponentFixture<TabComponent> = TestBed.createComponent(TabComponent);
  const component: TabComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('TabComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TabComponent]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = setUp();
    expect(component).toBeTruthy();
  });
});
