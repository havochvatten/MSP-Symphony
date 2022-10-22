import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HavLoaderComponent } from './hav-loader.component';

function setUp() {
  const fixture: ComponentFixture<HavLoaderComponent> = TestBed.createComponent(HavLoaderComponent);
  const component: HavLoaderComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('HavLoaderComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HavLoaderComponent ]
    })
    .compileComponents();
  }));

  it('should create', () => {
    const { component } = setUp();
    expect(component).toBeTruthy();
  });
});
