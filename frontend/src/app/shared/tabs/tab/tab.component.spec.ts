import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabComponent } from './tab.component';
import { provideZonelessChangeDetection } from "@angular/core";

describe('TabComponent', () => {
  let fixture: ComponentFixture<TabComponent>,
      component: TabComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection()
      ],
      declarations: [TabComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(TabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
