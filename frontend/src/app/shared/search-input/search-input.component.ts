import { Component, Input } from '@angular/core';
import { IconType } from '@shared/icon/icon.component';

@Component({
  selector: 'app-search-input',
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.scss']
})
export class SearchInputComponent {
  icon: IconType = 'search';
  @Input() label?: string;
  @Input() withLabel = false;
  @Input() value = '';
  @Input() placeholder?: string;
  @Input() onChange: ((value: string) => void) | undefined;
}
