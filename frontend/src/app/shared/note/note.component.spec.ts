import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NoteComponent } from './note.component';
import { IconComponent } from '../icon/icon.component';

describe('NoteComponent', () => {
  let fixture: ComponentFixture<NoteComponent>,
      component: NoteComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [NoteComponent, IconComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(NoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
