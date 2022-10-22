import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FooterComponent } from './footer.component';

function setUp() {
  const fixture: ComponentFixture<FooterComponent> = TestBed.createComponent(FooterComponent);
  const component: FooterComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('FooterComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FooterComponent]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = setUp();
    expect(component).toBeTruthy();
  });
});
