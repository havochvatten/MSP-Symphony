import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlideViewComponent } from './slide-view.component';
import { IconComponent } from '../icon/icon.component';
import { provideZonelessChangeDetection } from "@angular/core";
import { provideNoopAnimations } from "@angular/platform-browser/animations";

describe('SlideViewComponent', () => {
  let fixture: ComponentFixture<SlideViewComponent>,
      component: SlideViewComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideNoopAnimations(),
        provideZonelessChangeDetection()
      ],
      declarations: [SlideViewComponent, IconComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(SlideViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
