import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { BandGroup, Band, BandType_Alt } from '@data/metadata/metadata.interfaces';
import { Store } from '@ngrx/store';
import { State } from '@src/app/app-reducer';
import { MetadataActions } from '@data/metadata';
import { Observable } from 'rxjs';
import { ScenarioSelectors } from "@data/scenario";
import { ScenarioDisplayMeta } from "@data/scenario/scenario.interfaces";

//=== SEARCH UTILITIES ===

function searchTrim(search: string) {
  return search.trim().toLowerCase();
}

function filterLayers(layers: Band[], search: string): Band[] {
  return layers.filter(layer => layer.title.toLowerCase().includes(search));
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
        includesGroup(group.symphonyThemeName, search) ||
        filterLayers(group.bands, search).length > 0
    )
    .map(group => ({
      ...group,
      bands: includesGroup(group.symphonyThemeName, search)
        ? group.bands
        : filterLayers(group.bands, search)
    }));
}

type BandType = BandType_Alt;

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
  scenarioDisplayNames?: Observable<ScenarioDisplayMeta>;

  constructor(private store: Store<State>) {}

  ngOnInit() {
    this.scenarioDisplayNames = this.store.select(ScenarioSelectors.selectActiveScenarioDisplayMeta);
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

  onChange = (value: any, band: Band) => {
    this.store.dispatch(
      MetadataActions.selectBand({ band, value })
    );
  };

  onChangeVisible = (value: boolean, band: Band) => {
    this.store.dispatch(MetadataActions.setVisibility({ band, value }));
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
    return group.symphonyThemeName;
  }
}
