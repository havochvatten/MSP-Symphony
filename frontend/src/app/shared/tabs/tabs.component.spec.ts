import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabsComponent } from './tabs.component';
import { IconComponent } from '../icon/icon.component';
import { RouterModule } from "@angular/router";
import { provideZonelessChangeDetection } from "@angular/core";

describe('TabsComponent', () => {
  let fixture: ComponentFixture<TabsComponent>,
      component: TabsComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([])
      ],
      providers: [
        provideZonelessChangeDetection()
      ],
      declarations: [TabsComponent, IconComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(TabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
