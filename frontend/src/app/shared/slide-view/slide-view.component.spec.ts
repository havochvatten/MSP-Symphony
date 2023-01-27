import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SlideViewComponent } from './slide-view.component';
import { IconComponent } from '../icon/icon.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('SlideViewComponent', () => {
  let fixture: ComponentFixture<SlideViewComponent>,
      component: SlideViewComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule],
      declarations: [SlideViewComponent, IconComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(SlideViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
