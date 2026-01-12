import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HavLoaderComponent } from './hav-loader.component';
import { provideZonelessChangeDetection } from "@angular/core";

describe('HavLoaderComponent', () => {
  let fixture: ComponentFixture<HavLoaderComponent>,
      component: HavLoaderComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection()
      ],
      declarations: [ HavLoaderComponent ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(HavLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
