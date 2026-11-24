import { Component, EventEmitter, Output, Input, OnDestroy, inject } from '@angular/core';
import { UserActions, UserSelectors } from '@data/user';
import { Store } from '@ngrx/store';
import { State } from '@src/app/app-reducer';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-map-toolbar',
  templateUrl: './map-toolbar.component.html',
  styleUrls: ['./map-toolbar.component.scss'],
  standalone: false
})
export class MapToolbarComponent implements OnDestroy {
  private readonly store = inject<Store<State>>(Store);

  @Input() hasResults = false;
  @Input() drawIsActive = false;
  @Input() editingControls = true;
  @Output() zoomIn: EventEmitter<void> = new EventEmitter<void>();
  @Output() zoomOut: EventEmitter<void> = new EventEmitter<void>();
  @Output() clearResult?: EventEmitter<void> = new EventEmitter<void>();
  @Output() toggleDraw?: EventEmitter<void> = new EventEmitter<void>();

  private readonly aliasingSubscription$: Subscription;

  @Output() setMapOpacity: EventEmitter<number> = new EventEmitter<number>();

  hasImageSmoothing = true;

  constructor() {
    this.aliasingSubscription$ = this.store
      .select(UserSelectors.selectAliasing)
      .subscribe((aliasing: boolean) => {
        this.hasImageSmoothing = aliasing;
      });
  }

  onClickZoomIn() {
    this.zoomIn.emit();
  }

  onClickZoomOut() {
    this.zoomOut.emit();
  }

  onClearResult = () => this.clearResult?.emit();

  onToggleDraw = () => this.toggleDraw?.emit();

  onToggleSmooth() {
    this.store.dispatch(UserActions.updateUserSettings({ aliasing: !this.hasImageSmoothing }));
  }

  onClickSetMapOpacity = (opacity: number) => this.setMapOpacity.emit(opacity);

  ngOnDestroy(): void {
    this.aliasingSubscription$.unsubscribe();
  }
}
