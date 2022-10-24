import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StatusIconComponent } from './status-icon.component';

function setUp() {
  const fixture: ComponentFixture<StatusIconComponent> = TestBed.createComponent(
    StatusIconComponent
  );
  const component: StatusIconComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('StatusIconComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ StatusIconComponent ]
    })
    .compileComponents();
  }));

  it('should create', () => {
    const { component } = setUp();
    expect(component).toBeTruthy();
  });
});
