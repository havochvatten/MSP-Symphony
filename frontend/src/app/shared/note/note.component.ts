import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IconType } from '../icon/icon.component';

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss']
})
export class NoteComponent {
  icon: IconType = 'times';
  @Input() active = true;
  @Output() closeNote = new EventEmitter();
}
