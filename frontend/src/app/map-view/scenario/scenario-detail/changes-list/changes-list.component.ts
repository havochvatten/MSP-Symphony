import { Component, Input, ViewChild } from '@angular/core';
import { convertMultiplierToPercent } from '@data/metadata/metadata.selectors';
import { ChangesProperty } from "@data/scenario/scenario.interfaces";
import { AccordionBoxComponent } from "@shared/accordion-box/accordion-box.component";
import { BandChange, BandType } from "@data/metadata/metadata.interfaces";

@Component({
  selector: 'app-changes-list',
  templateUrl: './changes-list.component.html',
  styleUrls: ['./changes-list.component.scss']
})
export class ChangesListComponent {

  @Input() changes!: { [ bandType: string ] : ChangesProperty } | null;
  @Input() deleteChange!: (componentType: string, bandNumber: number, bandName: string) => void;
  @Input() bandDictionary!: { [ bandType: string ] : { [p: string]: string }} | null;

  @ViewChild('changesAccordion') changesAccordion: AccordionBoxComponent | undefined;

  convertMultiplierToPercent = convertMultiplierToPercent;

  hasChanges(): boolean {
    return this.changesCount() > 0;
  }

  changesCount(): number {
    return this.changes ? Object.keys(this.changes).reduce((sum, key) => {
      return sum + Object.keys(this.changes![key as BandType]).length;
    }, 0) : 0;
  }

  getChanges() : [BandChange, string][] {
    return this.changes ? Object.keys(this.changes).reduce((sum, key) => {
      return sum.concat(Object.keys(this.changes![key as BandType]).map(bandNumber => {
        return [this.changes![key as BandType][bandNumber], bandNumber];
      }));}, [] as [BandChange, string][]) : [];
  }
}
