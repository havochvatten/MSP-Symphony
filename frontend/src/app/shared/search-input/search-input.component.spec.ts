import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchInputComponent } from './search-input.component';
import { IconComponent } from '../icon/icon.component';
import { provideZonelessChangeDetection } from "@angular/core";

describe('SearchInputComponent', () => {
  let fixture: ComponentFixture<SearchInputComponent>,
      component: SearchInputComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection()
      ],
      declarations: [SearchInputComponent, IconComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(SearchInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
