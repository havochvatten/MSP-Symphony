import { Directive } from '@angular/core';
import { ListItemsSort } from "@data/common/sorting.interfaces";
import { textFilter } from "@shared/common.util";

@Directive({
  selector: '[appListable]',
})
export abstract class Listable {

  filterString = '';
  abstract setSort(sortType: ListItemsSort): void;

  setFilter(filterString: string) {
      this.filterString = filterString;
  }

  filter(input: string): boolean {
    return textFilter(input, this.filterString);
  }
}
