import { Component, OnInit, OnDestroy, Input, ChangeDetectorRef } from '@angular/core';
import { combineLatest, Subscription, take } from 'rxjs';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Store } from '@ngrx/store';
import { State } from '@src/app/app-reducer';
import { Band, BandType } from '@data/metadata/metadata.interfaces';
import { MetadataSelectors, MetadataActions } from '@data/metadata';
import { CalculationSelectors } from '@data/calculation';
import { LayerStyleService } from '../map/layers/layer-style.service';
import { ResultLayerService, ResultEntry } from '../map/layers/result-layer.service';
import { CalculationService } from '@data/calculation/calculation.service';
import { TranslateService } from '@ngx-translate/core';

interface LayerInstance {
  setVisible?(visible: boolean): void;
  setOpacity?(opacity: number): void;
}

interface BaseLayerItem {
  id: string;
  name: string;
}

export interface PrimaryLayerItem extends BaseLayerItem {
  kind: 'primary';
  visible: boolean;
  opacity: number;
  instance: LayerInstance | null;
}

export interface BandLayerItem extends BaseLayerItem {
  kind: 'band';
  band: Band;
  type: BandType;
  visible: boolean;
}

export interface ResultLayerItem extends BaseLayerItem {
  kind: 'result';
  entry: ResultEntry;
  visible: boolean;
}

export type LayerItem = PrimaryLayerItem | BandLayerItem | ResultLayerItem;

@Component({
  selector: 'app-layer-manager',
  templateUrl: './layer-manager.component.html',
  styleUrls: ['./layer-manager.component.scss'],
  standalone: false
})
export class LayerManagerComponent implements OnInit, OnDestroy {
  @Input() isExpanded = false;

  primaryLayers: PrimaryLayerItem[] = [];
  secondaryLayers: (BandLayerItem | ResultLayerItem)[] = [];

  editingLayerId: string | null = null;
  editingName = '';

  // Local name overrides — store is source-of-truth on first load, edits stay local
  private nameOverrides = new Map<string, string>();

  private sub?: Subscription;
  private langSub?: Subscription;

  constructor(
    private store: Store<State>,
    public layerStyleService: LayerStyleService,
    private resultLayerService: ResultLayerService,
    private calcService: CalculationService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.initializePrimaryLayers();
    this.langSub = this.translateService.onLangChange.subscribe(() => this.updatePrimaryLayerNames());

    this.sub = combineLatest([
      this.store.select(MetadataSelectors.selectVisibleBands),
      this.resultLayerService.results$,
      this.store.select(CalculationSelectors.selectCalculations)
    ]).subscribe(([components, results, calculations]) => {
      const bands: BandLayerItem[] = components.ecoComponent.map(b => ({
        kind: 'band' as const,
        id: `${b.symphonyCategory}-${b.bandNumber}`,
        name: this.nameOverrides.get(`${b.symphonyCategory}-${b.bandNumber}`) ?? b.title,
        band: b,
        type: 'ECOSYSTEM' as BandType,
        visible: this.layerStyleService.getBandVisibility('ECOSYSTEM', b.bandNumber)
      })).concat(components.pressureComponent.map(b => ({
        kind: 'band' as const,
        id: `${b.symphonyCategory}-${b.bandNumber}`,
        name: this.nameOverrides.get(`${b.symphonyCategory}-${b.bandNumber}`) ?? b.title,
        band: b,
        type: 'PRESSURE' as BandType,
        visible: this.layerStyleService.getBandVisibility('PRESSURE', b.bandNumber)
      })));

      const resultItems: ResultLayerItem[] = results.map(r => {
        const id = `result-${r.id}`;
        const calcName = calculations.find(c => c.id === r.id)?.name;
        return {
          kind: 'result' as const,
          id,
          name: this.nameOverrides.get(id) ?? calcName ?? r.name,
          entry: r,
          visible: r.layer.getVisible()
        };
      });

      this.secondaryLayers = [...bands, ...resultItems];
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    this.langSub?.unsubscribe();
  }

  private readonly primaryLayerKeys = [
    'map.layer-manager.layer-names.background',
    'map.layer-manager.layer-names.user-areas'
  ];

  private readonly primaryLayerIds = ['background', 'user-areas'];

  private initializePrimaryLayers() {
    this.translateService.get(this.primaryLayerKeys).pipe(take(1)).subscribe(t => {
      this.primaryLayers = this.primaryLayerIds.map((id, i) => ({
        kind: 'primary' as const,
        id,
        name: t[this.primaryLayerKeys[i]],
        visible: true,
        opacity: 1,
        instance: null
      }));
      this.cdr.markForCheck();
    });
  }

  private updatePrimaryLayerNames() {
    this.translateService.get(this.primaryLayerKeys).pipe(take(1)).subscribe(t => {
      this.primaryLayers.forEach((layer, i) => {
        layer.name = t[this.primaryLayerKeys[i]];
      });
      this.cdr.markForCheck();
    });
  }

  public setPrimaryLayerInstances(instances: {
    background?: LayerInstance,
    userAreas?: LayerInstance
  }) {
    const layerMap: { [key: string]: LayerInstance | undefined } = {
      'background': instances.background,
      'user-areas': instances.userAreas
    };

    this.primaryLayers.forEach(layer => {
      if (layerMap[layer.id] !== undefined) {
        layer.instance = layerMap[layer.id]!;
      }
    });
  }

  getOpacity(item: LayerItem): number {
    if (item.kind === 'primary') {
      return item.opacity * 100;
    } else if (item.kind === 'band') {
      return this.layerStyleService.getOpacity(item.type, item.band.bandNumber) * 100;
    } else {
      return this.layerStyleService.getResultOpacity(item.entry.id) * 100;
    }
  }

  toggleVisibility(item: LayerItem) {
    if (item.kind === 'primary') {
      item.visible = !item.visible;
      item.instance?.setVisible?.(item.visible);
    } else if (item.kind === 'band') {
      item.visible = !item.visible;
      this.layerStyleService.setBandVisibility(item.type, item.band.bandNumber, item.visible);
    } else {
      item.visible = !item.visible;
      item.entry.layer.setVisible(item.visible);
    }
  }

  changeOpacity(item: LayerItem, value: number) {
    const opacity = value / 100;

    if (item.kind === 'primary') {
      item.opacity = opacity;
      item.instance?.setOpacity?.(opacity);
    } else if (item.kind === 'band') {
      this.layerStyleService.setOpacity(item.type, item.band.bandNumber, opacity);
    } else {
      this.layerStyleService.setResultOpacity(item.entry.id, opacity);
      item.entry.layer.setOpacity(opacity);
    }
  }

  removeLayer(item: LayerItem) {
    if (item.kind === 'band') {
      this.nameOverrides.delete(item.id);
      // Restore visibility before removing so the band appears correctly if re-added
      this.layerStyleService.setBandVisibility(item.type, item.band.bandNumber, true);
      // Delegate removal to the store (BandLayer reacts via selectVisibleBands)
      this.store.dispatch(MetadataActions.setVisibility({ band: item.band, value: false }));
    } else if (item.kind === 'result') {
      this.nameOverrides.delete(item.id);
      this.calcService.removeResultPixels(item.entry.id);
      this.layerStyleService.clearResultOpacity(item.entry.id);
    }
  }

  startEditing(item: LayerItem) {
    if (!this.isRenamable(item)) {
      return;
    }
    this.editingLayerId = item.id;
    this.editingName = item.name;
  }

  cancelEditing() {
    this.editingLayerId = null;
    this.editingName = '';
  }

  saveLayerName(item: LayerItem) {
    const trimmed = this.editingName.trim();
    if (!trimmed || trimmed === item.name) {
      this.cancelEditing();
      return;
    }

    // Store name locally — never mutate store objects
    this.nameOverrides.set(item.id, trimmed);
    item.name = trimmed;

    this.cancelEditing();
  }

  onEditKeydown(event: KeyboardEvent, item: LayerItem) {
    if (event.key === 'Enter') {
      this.saveLayerName(item);
    } else if (event.key === 'Escape') {
      this.cancelEditing();
    }
  }

  drop(event: CdkDragDrop<(BandLayerItem | ResultLayerItem)[]>) {
    moveItemInArray(this.secondaryLayers, event.previousIndex, event.currentIndex);

    this.layerStyleService.reorderSecondaryLayers(
      this.secondaryLayers.map(item =>
        item.kind === 'band'
          ? { kind: 'band' as const, type: item.type, bandNumber: item.band.bandNumber }
          : { kind: 'result' as const, id: item.entry.id }
      )
    );
  }

  isPrimary(item: LayerItem): item is PrimaryLayerItem {
    return item.kind === 'primary';
  }

  isRemovable(item: LayerItem): boolean {
    return item.kind !== 'primary';
  }

  isDraggable(item: LayerItem): boolean {
    return item.kind !== 'primary';
  }

  isRenamable(item: LayerItem): boolean {
    return item.kind === 'result';
  }
}
