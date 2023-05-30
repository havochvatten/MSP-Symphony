import { Component, Input } from '@angular/core';

export const ICONS = [
  'anti-alias',
  'calculate',
  'compare',
  'chevron-down',
  'chevron-up',
  'circle',
  'delete',
  'dropdown-arrow',
  'edit',
  'enter-arrow',
  'eye',
  'eye-slash',
  'fish',
  'globe',
  'grid',
  'human',
  'info-circle',
  'layer-delete',
  'layer',
  'list',
  'matrix',
  'menu',
  'minus',
  'move',
  'normalization',
  'not-equal',
  'opacity',
  'open-folder',
  'padlock',
  'play-arrow',
  'plus',
  'polygon',
  'rectangle',
  'report',
  'save',
  'search',
  'shield',
  'sidebar-arrow-left',
  'sidebar-arrow-right',
  'sliders',
  'star-dot',
  'times',
  'triangle',
  'undo',
  'user',
  'zoom-in',
  'zoom-out'
] as const;

export type IconType = (typeof ICONS)[number];

@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss']
})
export class IconComponent {
  @Input() iconType: IconType = 'plus';
}
