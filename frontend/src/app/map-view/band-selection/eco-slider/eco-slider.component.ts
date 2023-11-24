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
import { fromEvent } from 'rxjs';
import { State } from '@src/app/app-reducer';
import { Band } from '@data/metadata/metadata.interfaces';
import { MetadataActions } from '@data/metadata';
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
  @Input() areaIsVisible = false;
  @Input() disabled = false
  @Input() locale = 'en';

  @ViewChild("constant") constantEl!: ElementRef;

  constructor(private store: Store<State>) {

  }

  ngOnInit() {

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
        componentType: this.band.symphonyCategory,
        band: this.band.bandNumber,
        attribute: 'offset',
        value: parseInt(value)
      })));
  }

  updateMultiplier(value: number) {
    this.store.dispatch(ScenarioActions.updateBandAttribute({
      componentType: this.band.symphonyCategory,
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
          { componentType: this.band.symphonyCategory,  bandNumber: this.band.bandNumber }));
    }
  }

  getDisabled() : boolean {
    return !(this.overridden || this.groupSetting);
  }

  updateLayerOpacity(value: number) {
    this.store.dispatch(MetadataActions.updateLayerOpacity({ value, band: this.band }));
  }
}
