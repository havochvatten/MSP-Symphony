import { Component, EventEmitter, Input, Output } from '@angular/core';
import { getNextSortType, ListItemsSort } from "@data/common/sorting.interfaces";

@Component({
  selector: 'app-list-filter',
  templateUrl: './list-filter.component.html',
  styleUrls: ['./list-filter.component.scss']
})
export class ListFilterComponent {

  @Input()  filterPlaceholder = '';
  @Output() filterChange    = new EventEmitter<string>();
  @Output() sortChange      = new EventEmitter<ListItemsSort>();

  sortType: ListItemsSort = ListItemsSort.None;
  filterString = '';

  protected readonly ListItemsSort = ListItemsSort;

  // Arguably `isDate` parameter would be more consistently implemented as an enum,
  // however that's considered overly verbose as long as we have only two possible
  // sorting criteria (textual / date)
  // Changing this is encouraged when/if other criteria are added, concievably
  // also differentiate ListItemSort into only Asc/Desc/None at that point?
  getNextSortType(isDate: boolean): ListItemsSort {
    return getNextSortType(this.sortType, isDate);
  }

  isActive(isDate: boolean) {
    return isDate ? this.sortType === ListItemsSort.DateAsc ||
                    this.sortType === ListItemsSort.DateDesc :
                    this.sortType === ListItemsSort.AlphaAsc ||
                    this.sortType === ListItemsSort.AlphaDesc;
  }

  i18n_key(isDate: boolean): string {
    return 'list-sorting-options.' + ListItemsSort[this.getNextSortType(isDate)];
  }

  cycle(isDate: boolean) {
    this.sortType = this.getNextSortType(isDate);
    this.sortChange.emit(this.sortType);
  }

  setFilter() {
    this.filterChange.emit(this.filterString);
  }
}
