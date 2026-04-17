import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoaderComponent } from './loader.component';
import { provideZonelessChangeDetection } from "@angular/core";

describe('LoaderComponent', () => {
  let fixture: ComponentFixture<LoaderComponent>, component: LoaderComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
      declarations: [LoaderComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(LoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
