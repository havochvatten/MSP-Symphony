import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SlideViewComponent } from './slide-view.component';
import { IconComponent } from '../icon/icon.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

function setUp() {
  const fixture: ComponentFixture<SlideViewComponent> = TestBed.createComponent(SlideViewComponent);
  const component: SlideViewComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('SlideViewComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule],
      declarations: [SlideViewComponent, IconComponent]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = setUp();
    expect(component).toBeTruthy();
  });
});
