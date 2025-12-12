import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HighestImpactsComponent } from './highest-impacts.component';
import { provideZonelessChangeDetection } from "@angular/core";

describe('HighestImpactsComponent', () => {
  let fixture: ComponentFixture<HighestImpactsComponent>,
      component: HighestImpactsComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection()
      ],
      declarations: [ HighestImpactsComponent ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(HighestImpactsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
