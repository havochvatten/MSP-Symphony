import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoteComponent } from './note.component';
import { IconComponent } from '../icon/icon.component';
import { provideZonelessChangeDetection } from "@angular/core";

describe('NoteComponent', () => {
  let fixture: ComponentFixture<NoteComponent>,
      component: NoteComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection()
      ],
      declarations: [NoteComponent, IconComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(NoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
