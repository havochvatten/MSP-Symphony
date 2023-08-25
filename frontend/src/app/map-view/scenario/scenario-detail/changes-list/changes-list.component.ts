import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { convertMultiplierToPercent } from '@data/metadata/metadata.selectors';
import { ChangesProperty } from "@data/scenario/scenario.interfaces";
import { AccordionBoxComponent } from "@shared/accordion-box/accordion-box.component";
import { MetadataSelectors } from "@data/metadata";
import { Store } from "@ngrx/store";
import { State } from "@src/app/app-reducer";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Component({
  selector: 'app-changes-list',
  templateUrl: './changes-list.component.html',
  styleUrls: ['./changes-list.component.scss']
})
export class ChangesListComponent {

  @Input() changes!: ChangesProperty | null;
  @Input() displayNames!: Record<string, string>[];
  @Input() deleteChange!: (bandId: string) => void;

  @ViewChild('changesAccordion') changesAccordion: AccordionBoxComponent | undefined;
  private bandDictionary: Observable<{ [p: string]: string }>;

  constructor(private store: Store<State>) {
    this.bandDictionary = this.store.select(MetadataSelectors.selectMetaDisplayDictionary);
  }

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

  getDisplayName(bandId: string): Observable<string> {
    return this.bandDictionary.pipe(map((bandDictionary) => bandDictionary[bandId]));
  }
}
