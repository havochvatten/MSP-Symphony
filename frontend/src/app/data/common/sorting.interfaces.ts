export interface SortableListItem {
  name: string;
  timestamp: number;
}

export enum ListItemsSort {
  None,
  AlphaAsc,
  AlphaDesc,
  DateAsc,
  DateDesc
}

export type SortActionProps = {
    sortType: ListItemsSort;
};

export const sortFuncMap = {
  [ListItemsSort.AlphaAsc]:   (a: SortableListItem, b: SortableListItem) => a.name.localeCompare(b.name),
  [ListItemsSort.AlphaDesc]:  (a: SortableListItem, b: SortableListItem) => b.name.localeCompare(a.name),
  [ListItemsSort.DateAsc]:    (a: SortableListItem, b: SortableListItem) => a.timestamp - b.timestamp,
  [ListItemsSort.DateDesc]:   (a: SortableListItem, b: SortableListItem) => b.timestamp - a.timestamp,
  [ListItemsSort.None]:       (a: any, b: any) => 0
};

const nextSortType :Map<ListItemsSort, ListItemsSort> =
  new Map([
      [ListItemsSort.AlphaAsc, ListItemsSort.AlphaDesc],
      [ListItemsSort.AlphaDesc, ListItemsSort.None],
      [ListItemsSort.DateDesc, ListItemsSort.DateAsc],
      [ListItemsSort.DateAsc, ListItemsSort.None]
    ]);

// See comment in app/shared/list-filter/list-filter.component.html regarding
// prospectively "splitting" the enum into two separate enums instead of crude
// disambiguation with `isDate` parameter
export const getNextSortType = (sortType: ListItemsSort, isDate: boolean): ListItemsSort => {
  if(sortType === ListItemsSort.None ||
    (isDate && [ListItemsSort.AlphaAsc, ListItemsSort.AlphaDesc].includes(sortType) ||
    (!isDate && [ListItemsSort.DateAsc, ListItemsSort.DateDesc].includes(sortType)))) {
    return isDate ? ListItemsSort.DateDesc : ListItemsSort.AlphaAsc;
  }
  return nextSortType.get(sortType) as ListItemsSort;
}
