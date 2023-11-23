import { Component, OnInit } from '@angular/core';
import { Observable } from "rxjs";
import { take } from "rxjs/operators";
import { DialogRef } from "@shared/dialog/dialog-ref";
import { DialogConfig } from "@shared/dialog/dialog-config";
import { Scenario, ScenarioChangeMap } from "@data/scenario/scenario.interfaces";
import { BandChange, BandGroup } from "@data/metadata/metadata.interfaces";
import { BandType_Alt as BandType, BandType as _BandType } from "@data/metadata/metadata.interfaces";
import { Store } from "@ngrx/store";
import { State } from "@src/app/app-reducer";
import { MetadataSelectors } from "@data/metadata";

interface BandShim {
  number: number;
  name: string;
}

@Component({
  selector: 'app-changes-overview',
  templateUrl: './changes-overview.component.html',
  styleUrls: ['./changes-overview.component.scss']
})
export class ChangesOverviewComponent implements OnInit {

  scenario: Scenario;
  bands: Observable<Record<string, BandGroup[]>>;
  groupMap: Map<BandType,  Record<string, BandShim[]>> =
    new Map([['ecoComponents', {}], ['pressures', {}]]);
  areaChangeMap: {[ areaIndex: number ]: ScenarioChangeMap } = {[-1] : {}};
  allChangedBands: Map<BandType, Set<number>> =
    new Map([['ecoComponents', new Set<number>()],
             ['pressures', new Set<number>()]]);
  ecoChanges: boolean = false;
  pressureChanges: boolean = false;
  bothTypes: boolean = false;
  editingCell: boolean = false;
  hasChanged: boolean = false;

  // these naming discrepancies should be consolidated at some point
  bandTypeDict: Map<string, BandType> = new Map([
    ['pressures', 'pressures'],
    ['ecoComponents', 'ecoComponents'],
    ['ecoComponent', 'ecoComponents'],
    ['pressureComponent', 'pressures'],
    ['ECOSYSTEM', 'ecoComponents'],
    ['PRESSURE', 'pressures']]);

  getBandType(bandType: string): BandType {
    return this.bandTypeDict.get(bandType)!;
  }

  constructor(
    public dialog: DialogRef,
    private config: DialogConfig,
    private store: Store<State>
  ) {
      this.scenario = this.config.data.scenario;
      this.bands = this.store.select(MetadataSelectors.selectMetadata)

      if(this.scenario.changes) {
        for(const category of ['ECOSYSTEM', 'PRESSURE']) {
          if(this.scenario.changes[category]) {
            for (const band in this.scenario.changes[category]) {
              const bandChange = this.scenario.changes[category][band];
              if (bandChange) {
                this.addChange(-1, +band, bandChange)
              }
            }
          }
        }
      }

      for(const area in this.scenario.areas) {
        const areaChange = this.scenario.areas[area].changes;
        if(areaChange) {
          for(const category of ['ECOSYSTEM', 'PRESSURE']) {
            if(areaChange[category]) {
              for (const band in areaChange[category]) {
                const bandChange = areaChange[category][band];
                if(bandChange) {
                  this.addChange(+area, +band, bandChange)
                }
              }
            }
          }
        }
      }

      this.bothTypes = this.ecoChanges && this.pressureChanges;
  }

  async ngOnInit(): Promise<void> {
    const bandMeta = await (this.bands).pipe(take(1)).toPromise();
    for(const bandType in bandMeta) { // ecocomponents, pressures
      for(const bandGroup of bandMeta[bandType]) {
        for(const band of bandGroup.bands) {
          if(this.allChangedBands.get(this.getBandType(bandType))!.has(band.bandNumber)) {
            this.setGroupedChangeToDisplay(bandType, bandGroup.symphonyThemeName,
              { number: band.bandNumber, name: band.title })
          }
        }
      }
    }
  }

  getChange(bandType: string, areaIndex: number, id: number): BandChange {
    const thisType = this.getBandType(bandType);
    if( Object.keys(this.areaChangeMap[areaIndex]).includes(thisType) &&
      Object.keys(this.areaChangeMap[areaIndex][thisType]).includes(String(id))
    ) {
      return this.areaChangeMap[areaIndex][thisType][id];
    }
    return { type: bandType === 'ecoComponents' ? 'ECOSYSTEM' : 'PRESSURE',
             multiplier: 1,
             offset: undefined };
  }

  addChange(areaIndex: number, bandId: number, bandChange: BandChange) {
    const thisType = this.getBandType(bandChange.type);
    this.ecoChanges ||=      bandChange.type === 'ECOSYSTEM';
    this.pressureChanges ||= bandChange.type === 'PRESSURE';
    this.allChangedBands.get(thisType)!.add(bandId);
    this.areaChangeMap[areaIndex] = this.areaChangeMap[areaIndex] || {};
    this.areaChangeMap[areaIndex][thisType] = this.areaChangeMap[areaIndex][thisType] || {};
    this.areaChangeMap[areaIndex][thisType][bandId] = bandChange;
  }

  setGroupedChangeToDisplay(bandType: string, theme: string, band: BandShim) {
    if(!this.groupMap.get(this.getBandType(bandType))![theme])
      this.groupMap.get(this.getBandType(bandType))![theme] = [];
    this.groupMap.get(this.getBandType(bandType)!)![theme].push(band);
  }

  selectedBandTypes(): BandType[] {
    const selectedBandTypes: BandType[] = [];
    if(this.ecoChanges) selectedBandTypes.push('ecoComponents');
    if(this.pressureChanges) selectedBandTypes.push('pressures');
    return selectedBandTypes;
  }

  selectType(value: string) {
    this.ecoChanges       = value === 'both' || value === 'ecoComponents';
    this.pressureChanges  = value === 'both' || value === 'pressures';
  }

  setEditingCell($event: {areaIndex: number, change: BandChange, bandNumber: number} | null) {
    this.editingCell = $event === null;

    if(!this.editingCell) {
      const change = $event!.change, bandNumber = $event!.bandNumber, areaIndex = $event!.areaIndex
      if((change.multiplier !== undefined && change.multiplier === 1) ||
         (change.offset !== undefined && change.offset === 0)) {
        this.hasChanged = true;
        this.allChangedBands.get(this.getBandType(change.type))!.delete(bandNumber);
      } else {
        const prevChange = this.getChange(change.type, areaIndex, bandNumber);
        this.hasChanged = prevChange.multiplier !== change.multiplier || prevChange.offset !== change.offset;
        this.addChange(areaIndex, bandNumber, change!);
      }
    }
  }
}
