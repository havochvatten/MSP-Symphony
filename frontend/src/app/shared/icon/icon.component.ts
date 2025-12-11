import { Component, Input } from '@angular/core';

export type IconType =
     'anti-alias'
   | 'calculate'
   | 'compare'
   | 'chevron-down'
   | 'chevron-up'
   | 'circle'
   | 'choice'
   | 'copy'
   | 'copy-setting'
   | 'cross'
   | 'data-reliability'
   | 'delete'
   | 'dropdown-arrow'
   | 'edit'
   | 'enter-arrow'
   | 'eye'
   | 'eye-slash'
   | 'fish'
   | 'globe'
   | 'grid'
   | 'human'
   | 'info-circle'
   | 'info-circle-large'
   | 'layer-delete'
   | 'layer'
   | 'list'
   | 'matrix'
   | 'menu'
   | 'minus'
   | 'move'
   | 'normalization'
   | 'not-equal'
   | 'opacity'
   | 'open-folder'
   | 'padlock'
   | 'play-arrow'
   | 'plus'
   | 'polygon'
   | 'rectangle'
   | 'report'
   | 'save'
   | 'search'
   | 'shield'
   | 'sidebar-arrow-left'
   | 'sidebar-arrow-right'
   | 'sliders'
   | 'sort-alphaA'
   | 'sort-alphaD'
   | 'sort-dateA'
   | 'sort-dateD'
   | 'split'
   | 'star-dot'
   | 'table'
   | 'times'
   | 'triangle'
   | 'undo'
   | 'user'
   | 'zoom-in'
   | 'zoom-out';

@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss'],
  standalone: false
})
export class IconComponent {
  @Input() iconType: IconType = 'plus';
}
