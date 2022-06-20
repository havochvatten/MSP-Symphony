import { AfterViewInit, Component, Input } from '@angular/core';
import { StatePath, Band, BandChange} from '@data/metadata/metadata.interfaces';
import { Store } from "@ngrx/store";
import { State } from "@src/app/app-reducer";
import { ScenarioSelectors } from "@data/scenario";
import { intersection } from "@src/util/set-operations";
import { ChangesProperty } from "@data/scenario/scenario.interfaces";

@Component({
  selector: 'app-checkbox-accordion',
  templateUrl: './checkbox-accordion.component.html',
  styleUrls: ['./checkbox-accordion.component.scss']
})
export class CheckboxAccordionComponent implements AfterViewInit {
  @Input() title?: string;
  @Input() checked?: boolean;
  @Input() bands: Band[] = [];
  @Input() selectedArea = undefined;
  @Input() searching = false;
  @Input() change: (value: any, statePath: StatePath) => void = () => {};
  @Input() changeVisible: (value: boolean, statePath: StatePath) => void = () => {};
  open = false;
  toggle: () => void = () => this.open = !this.open;

  private groupBandNumbers = new Set();

  constructor(private store: Store<State>) {
    this.store.select(ScenarioSelectors.selectActiveScenarioFeatureChanges).subscribe((changes: ChangesProperty) => {
      const changesBandNumbers = new Set(Object.values(changes).map(c => c['band']));
      this.open = intersection(this.groupBandNumbers, changesBandNumbers).size>0
    });
  }

  ngAfterViewInit() {
    this.groupBandNumbers = new Set(this.bands.map(b => b.bandNumber));
  }

  private changeAll(checked: boolean) {
    this.bands.forEach(band => {
      const { statePath } = band;
      this.onChange(checked, statePath);
    })
  }

  onChange = (checked: boolean, statePath: StatePath) =>
    this.change(checked, statePath);

  onChangeVisible = (visible: boolean, statePath: StatePath) =>
    this.changeVisible(visible, statePath);

  get allBoxesAreChecked(): boolean {
    return this.bands.filter(({ selected }) => !selected).length === 0;
  }

  get noBoxesAreChecked(): boolean {
    return this.bands.filter(({ selected }) => selected).length === 0;
  }

  updateAll() {
    this.changeAll(this.noBoxesAreChecked)
  }

  bandName(index: number, band: Band) {
    return band.statePath;
  }
}
