import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { BandGroup, Band, StatePath } from '@data/metadata/metadata.interfaces';
import { Store } from '@ngrx/store';
import { State } from '@src/app/app-reducer';
import { MetadataActions } from '@data/metadata';
import { Observable } from 'rxjs';
import { AreaSelectors } from '@data/area';
import { Area } from '@data/area/area.interfaces';

//=== SEARCH UTILITIES ===

function searchTrim(search: string) {
  return search.trim().toLowerCase();
}

function filterLayers(layers: Band[], search: string): Band[] {
  return layers.filter(layer => layer.displayName.toLowerCase().includes(search));
}
function includesGroup(groupName: string, search: string): boolean {
  return groupName.toLowerCase().includes(search);
}

function filterCheckBoxGroups(groups: BandGroup[], search: string): BandGroup[] {
  if (search === '') {
    return groups;
  }
  search = searchTrim(search);

  return groups
    .filter(
      (group: BandGroup) =>
        includesGroup(group.displayName, search) ||
        filterLayers(group.properties, search).length > 0
    )
    .map(group => ({
      ...group,
      properties: includesGroup(group.displayName, search)
        ? group.properties
        : filterLayers(group.properties, search)
    }));
}

type BandType = 'ecoComponents' | 'pressures';

@Component({
  selector: 'app-band-selection',
  templateUrl: './band-selection.component.html',
  styleUrls: ['./band-selection.component.scss']
})
export class BandSelectionComponent implements OnInit, OnChanges {
  @Input() title?: string;
  @Input() bandGroups: BandGroup[] = [];
  @Input() bandType: BandType = 'ecoComponents';
  search = '';
  filteredGroups: BandGroup[] = [];
  selectedArea?: Observable<Area | undefined>;

  constructor(private store: Store<State>) {}

  ngOnInit() {
    this.selectedArea = this.store.select(AreaSelectors.selectSelectedAreaData);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.search || changes.bandGroups) {
      this.filteredGroups = filterCheckBoxGroups(this.bandGroups, this.search);
    }
  }

  onSearch = (value: string) => {
    if (typeof value === 'string') {
      this.search = value;
      this.filteredGroups = filterCheckBoxGroups(this.bandGroups, this.search);
    }
  };

  onChange = (value: any, statePath: StatePath) => {
    this.store.dispatch(
      MetadataActions.updateSelections({
        selections: [
          {
            value,
            statePath
          }
        ]
      })
    );
  };

  onChangeVisible = (value: boolean, statePath: StatePath) => {
    this.store.dispatch(MetadataActions.updateVisible({ selections: [{ value, statePath }] }));
  };

  get placeholder() {
    return this.bandType === 'ecoComponents'
      ? 'map.eco-component.search.placeholder'
      : 'map.pressure.search.placeholder';
  }

  get label() {
    return this.bandType === 'ecoComponents'
      ? 'map.eco-component.search.label'
      : 'map.pressure.search.label';
  }

  displayName(index: number, group: BandGroup) {
    return group.displayName;
  }
}
