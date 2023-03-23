import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TabComponent } from './tab.component';

describe('TabComponent', () => {
  let fixture: ComponentFixture<TabComponent>,
      component: TabComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TabComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(TabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
