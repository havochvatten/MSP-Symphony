import { AfterViewInit, Component, Input } from '@angular/core';
import { Band, BandType } from '@data/metadata/metadata.interfaces';
import { Store } from "@ngrx/store";
import { State } from "@src/app/app-reducer";
import { ScenarioSelectors } from "@data/scenario";
import { intersection } from "@src/util/set-operations";
import { ChangesProperty } from "@data/scenario/scenario.interfaces";
import { MatCheckboxChange } from "@angular/material/checkbox";

@Component({
  selector: 'app-checkbox-accordion',
  templateUrl: './checkbox-accordion.component.html',
  styleUrls: ['./checkbox-accordion.component.scss']
})
export class CheckboxAccordionComponent implements AfterViewInit {
  @Input() title?: string;
  @Input() checked?: boolean;
  @Input() category!: BandType;
  @Input() bands: Band[] = [];
  @Input() selectedArea = undefined;
  @Input() scenarioActive = false;
  @Input() searching = false;
  @Input() change!: (value: boolean|undefined, band: Band) => void;
  @Input() changeVisible!: (value: boolean, band: Band) => void;
  @Input() changeVisibleReliability!: (value: boolean, band: Band) => void;
  @Input() open = false;
  toggle: () => void = () => this.open = !this.open;

  private groupBandNumbers = new Set();

  constructor(private store: Store<State>) {
    this.store.select(ScenarioSelectors.selectActiveScenarioChanges)
        .subscribe(( changes: {[bandType: string] : ChangesProperty }) => {
          const changesBandNumbers = !changes[this.category] ? new Set() : new Set(Object.keys(changes[this.category]).map(n => +n));
          this.open ||= intersection(this.groupBandNumbers, changesBandNumbers).size>0
        });
  }

  ngAfterViewInit() {
    this.groupBandNumbers = new Set(this.bands.map(b => b.bandNumber));
  }

  private changeAll(checked: boolean) {
    this.bands.forEach(band => this.change(checked, band));
  }

  onChange = (evt: MatCheckboxChange, band: Band) => this.change(evt.checked, band);

  onChangeVisible = (visible: boolean, band: Band) => {
    if(!(band.visible && !band.loaded)) {
      this.changeVisible(visible, band);
    }
  }

  onChangeVisibleReliability = (visible: boolean, band: Band) => {
    this.changeVisibleReliability(visible, band);
  }

  get allBoxesAreChecked(): boolean {
    return this.bands.filter(({ selected }) => !selected).length === 0;
  }

  get noBoxesAreChecked(): boolean {
    return this.bands.filter(({ selected }) => selected).length === 0;
  }

  get someBoxesAreChecked(): boolean {
    return !this.allBoxesAreChecked && !this.noBoxesAreChecked;
  }

  updateAll() {
    this.changeAll(!this.allBoxesAreChecked)
  }

  bandNumber(index: number, band: Band) {
    return band.bandNumber;
  }
}
