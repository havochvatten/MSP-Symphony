import { Component, ElementRef, EventEmitter, HostBinding,
         Input, Output, ViewChild, OnInit } from '@angular/core';
import { Store } from "@ngrx/store";
import { State } from "@src/app/app-reducer";
import { BandChange  } from "@data/metadata/metadata.interfaces";
import { ScenarioActions } from "@data/scenario";
import { convertMultiplierToPercent } from "@data/metadata/metadata.selectors";

@Component({
  selector: 'app-overview-inline-band-change',
  templateUrl: './overview-inline-band-change.component.html',
  styleUrls: ['./overview-inline-band-change.component.scss']
})
export class OverviewInlineBandChangeComponent implements OnInit {

  @Input() change!: BandChange;
  @Input() currentValueAsString!: string;
  @Input() areaIndex!: number;
  @Input() bandNumber!: number;

  @Output() editModeChange = new EventEmitter<object | null>();
  @HostBinding('className') componentClass = '';

  @ViewChild("offsetInput") offsetInput!: ElementRef;
  @ViewChild("multiplierInput") multiplierInput!: ElementRef;

  changeType: 'constant' | 'relative' = 'constant';
  editMode = false;

  localMultiplier = 1;
  localOffset = 0;

  constructor(private store: Store<State>) {}

  editValue() {
    this.editMode = true;
    this.editModeChange.emit(null);
    this.componentClass = 'cell-editing';

    if (this.changeType === 'constant') {
        this.offsetInput.nativeElement.focus();
    } else {
        this.multiplierInput.nativeElement.focus();
    }
  }

  checkEmptyValue(): boolean {
    const change = this.getChange()!;
    return (this.changeType === 'relative' && change.multiplier === 1) ||
           (this.changeType === 'constant' && change.offset === 0);
  }

  displayValue(): string {
    if(this.checkEmptyValue()) {
      return '-';
    } else {
      const change = this.getChange()!;
      return change.multiplier ? parseFloat(Number(convertMultiplierToPercent(change.multiplier!) * 100).toFixed(2)) + '%' :
        (change.offset ? String(change.offset) : '-');
    }
  }

  // Side effects: resets localMultiplier and localOffset
  // when returning other value
  getChange(): BandChange {
    const change = { ...this.change };
    if(this.changeType === 'constant') {
      change.multiplier = undefined;
      change.offset = this.localOffset;
      this.localMultiplier = 1;
    } else {
      change.multiplier = this.localMultiplier;
      change.offset = undefined;
      this.localOffset = 0;
    }
    return change;
  }

  exitEditMode() {
    this.editMode = false;
    this.editModeChange.emit({areaIndex: this.areaIndex, change: this.getChange(), bandNumber: this.bandNumber});
    this.componentClass = '';
  }

  confirmChange() {
    const change = this.getChange();
    if (this.checkEmptyValue()) {
      this.store.dispatch(ScenarioActions.deleteBandChangeForAreaIndex({
        componentType: this.change!.type,
        areaIndex: this.areaIndex === -1 ? undefined : this.areaIndex,
        band: this.bandNumber
      }));
    } else {
        this.store.dispatch(ScenarioActions.updateBandAttributeForAreaIndex({
            areaIndex: this.areaIndex === -1 ? undefined : this.areaIndex,
            componentType: this.change!.type,
            band: this.bandNumber,
            attribute: this.changeType === 'constant' ? 'offset' : 'multiplier',
            value: this.changeType === 'constant' ? this.localOffset : this.localMultiplier,
        }));
    }

    this.exitEditMode();
  }

  setType(value: string) {
    this.changeType = value as 'constant' | 'relative';
  }

  ngOnInit(): void {
    this.changeType = this.change?.multiplier !== undefined ? 'relative' : 'constant';
    this.localMultiplier = this.change?.multiplier ?? 1;
    this.localOffset = this.change?.offset ?? 0;
  }

  setChange($event: Event) {
    const target = ($event.target as HTMLInputElement);
    let value = +target.value;

    if (this.changeType === 'relative') {
      value = value > 150 ? 150 : value;
      this.localMultiplier = +(value.toFixed(2)) / 100 + 1;
      this.multiplierInput.nativeElement.value = ((this.localMultiplier - 1) * 100) | 0;
    } else {
      this.localOffset = value > 150 ? 150 : value;
      this.offsetInput.nativeElement.value = this.localOffset;
    }
  }
}
