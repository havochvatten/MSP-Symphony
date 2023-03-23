import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SearchInputComponent } from './search-input.component';
import { IconComponent } from '../icon/icon.component';

describe('SearchInputComponent', () => {
  let fixture: ComponentFixture<SearchInputComponent>,
      component: SearchInputComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SearchInputComponent, IconComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(SearchInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
