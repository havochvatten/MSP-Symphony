import { Component, Input } from '@angular/core';
import { StatePath } from '@data/metadata/metadata.interfaces';

export interface CheckboxItem {
  label: string;
  checked: boolean;
  statePath: StatePath;
}

@Component({
  selector: 'app-checkbox-group',
  templateUrl: './checkbox-group.component.html',
  styleUrls: ['./checkbox-group.component.scss']
})
export class CheckboxGroupComponent {
  showItems = false;
  @Input() title?: string;
  @Input() statePath?: StatePath;
  @Input() checked?: boolean;
  @Input() items: CheckboxItem[] = [];
  @Input() change: (item: CheckboxItem) => void = () => {}

  private changeAll(checked: boolean) {
    this.items.forEach(item => {
      const { label, statePath } = item;
      this.onChange(checked, label, statePath);
    })
  }

  onChange = (checked: boolean, label: string, statePath: StatePath) =>
    this.change({ label, checked, statePath });

  get allBoxesAreChecked(): boolean {
    return this.items.filter(({ checked }) => !checked).length === 0;
  }

  get noBoxesAreChecked(): boolean {
    return this.items.filter(({ checked }) => checked).length === 0;
  }

  updateAll() {
    this.changeAll(this.noBoxesAreChecked)
  }

  toggleItems() {
    this.showItems = !this.showItems;
  }
}
