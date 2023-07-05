import { Component, EventEmitter, Output, Input, OnDestroy } from '@angular/core';
import { UserActions, UserSelectors } from "@data/user";
import { Store } from "@ngrx/store";
import { State } from "@src/app/app-reducer";
import { Subscription } from "rxjs";

@Component({
  selector: 'app-map-toolbar',
  templateUrl: './map-toolbar.component.html',
  styleUrls: ['./map-toolbar.component.scss']
})
export class MapToolbarComponent implements OnDestroy {
  @Input() hasResults = false;
  @Input() drawIsActive = false;
  @Output() zoomIn: EventEmitter<void> = new EventEmitter<void>();
  @Output() zoomOut: EventEmitter<void> = new EventEmitter<void>();
  @Output() clearResult: EventEmitter<void> = new EventEmitter<void>();
  @Output() toggleDraw: EventEmitter<void> = new EventEmitter<void>();

  private readonly aliasingSubscription$: Subscription;

  @Output() setMapOpacity: EventEmitter<number> = new EventEmitter<number>();

  hasImageSmoothing: boolean = true;

  constructor(
    private readonly store: Store<State>
  ) {
    this.aliasingSubscription$ = this.store.select(UserSelectors.selectAliasing).subscribe((aliasing: boolean) => {
      this.hasImageSmoothing = aliasing;
    });
  }

  onClickZoomIn() {
    this.zoomIn.emit();
  }

  onClickZoomOut() {
    this.zoomOut.emit();
  }

  onClearResult = () => this.clearResult.emit();

  onToggleDraw = () => this.toggleDraw.emit();

  onToggleSmooth() {
    this.store.dispatch(UserActions.setAliasing({ aliasing: !this.hasImageSmoothing }));
  }

  onClickSetMapOpacity = (opacity: number) => this.setMapOpacity.emit(opacity);

  ngOnDestroy(): void {
    this.aliasingSubscription$.unsubscribe();
  }
}
