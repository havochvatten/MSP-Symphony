import { Component, Input, ViewChild } from '@angular/core';
import { convertMultiplierToPercent } from '@data/metadata/metadata.selectors';
import { ChangesProperty } from "@data/scenario/scenario.interfaces";
import { AccordionBoxComponent } from "@shared/accordion-box/accordion-box.component";

@Component({
  selector: 'app-changes-list',
  templateUrl: './changes-list.component.html',
  styleUrls: ['./changes-list.component.scss']
})
export class ChangesListComponent {

  @Input() changes!: ChangesProperty | null;
  @Input() displayNames!: Record<string, string>[];
  @Input() deleteChange!: (bandId: string) => void;
  @Input() bandDictionary!: { [p: string]: string };

  @ViewChild('changesAccordion') changesAccordion: AccordionBoxComponent | undefined;

  convertMultiplierToPercent = convertMultiplierToPercent;

  hasChanges(): boolean {
    return this.changesCount() > 0;
  }

  changesCount(): number {
    return this.changes ? Object.keys(this.changes!).length : 0;
  }

  getChanges(): ChangesProperty | null {
    return this.changes;
  }
}
