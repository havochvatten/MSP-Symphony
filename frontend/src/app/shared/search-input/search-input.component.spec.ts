import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SearchInputComponent } from './search-input.component';
import { IconComponent } from '../icon/icon.component';

function setUp() {
  const fixture: ComponentFixture<SearchInputComponent> = TestBed.createComponent(SearchInputComponent);
  const component: SearchInputComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('SearchInputComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SearchInputComponent, IconComponent]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = setUp();
    expect(component).toBeTruthy();
  });
});
