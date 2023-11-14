import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { Store } from '@ngrx/store';
import { fromEvent, throwError } from 'rxjs';
import { State } from '@src/app/app-reducer';
import { Band, StatePath } from '@data/metadata/metadata.interfaces';
import { MetadataActions } from '@data/metadata';
import { getComponentType } from '@data/metadata/metadata.selectors';
import { ScenarioActions } from "@data/scenario";
import { debounceTime, map } from "rxjs/operators";

@Component({
  selector: 'app-eco-slider',
  templateUrl: './eco-slider.component.html',
  styleUrls: ['./eco-slider.component.scss']
})
export class EcoSliderComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() multiplier!: number;
  @Input() offset!: number;
  @Input() band!: Band;
  @Input() groupSetting!: boolean;
  @Input() overridden!: boolean;
  @Input() statePath: StatePath = [];
  @Input() areaIsVisible = false;
  @Input() disabled = false
  @Input() locale = 'en';

  @ViewChild("constant") constantEl!: ElementRef;

  constructor(private store: Store<State>) {

  }

  ngOnInit() {
    if (this.statePath === undefined || this.statePath.length === 0)
      throwError('Property statePath is missing or empty');
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['layerOpacity'] && changes['layerOpacity'].currentValue === undefined) {
      this.band.layerOpacity = 100;
    }
    if (changes.multiplier && changes.multiplier.currentValue === undefined) {
      this.multiplier = 1;
    }
    if (changes.offset && changes.offset.currentValue === undefined) {
      this.offset = 0;
    }
  }

  ngAfterViewInit() {
    fromEvent(this.constantEl.nativeElement, 'input').pipe(
      map((event: any) => (event.target as HTMLInputElement).value),
      debounceTime(300)
    ).subscribe(value =>
      this.store.dispatch(ScenarioActions.updateBandAttribute({
        componentType: getComponentType(this.statePath),
        band: this.band.bandNumber,
        attribute: 'offset',
        value: parseInt(value)
      })));
  }

  updateMultiplier(value: number) {
    this.store.dispatch(ScenarioActions.updateBandAttribute({
      componentType: getComponentType(this.statePath),
      band: this.band.bandNumber,
      attribute: 'multiplier',
      value
    }));
  }

  setOverride(setOverride: boolean) {
    if(setOverride) {
      this.updateMultiplier(1);
    } else {
      this.store.dispatch(ScenarioActions.deleteAreaBandChange(
          { componentType: getComponentType(this.band.statePath),  bandNumber: this.band.bandNumber }));
    }
  }

  getDisabled() {
    return !(this.overridden || this.groupSetting);
  }

  updateLayerOpacity(value: number) {
    this.store.dispatch(MetadataActions.updateLayerOpacity({ value, bandPath: this.statePath }));
  }
}
