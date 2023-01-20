import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { TabsComponent } from './tabs.component';
import { IconComponent } from '../icon/icon.component';

describe('TabsComponent', () => {
  let fixture: ComponentFixture<TabsComponent>,
      component: TabsComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [TabsComponent, IconComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(TabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
