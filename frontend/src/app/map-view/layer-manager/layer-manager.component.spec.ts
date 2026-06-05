import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { LayerManagerComponent, BandLayerItem, ResultLayerItem } from './layer-manager.component';
import { AutoSelectDirective } from './auto-select.directive';
import { provideMockStore } from '@ngrx/store/testing';
import { SharedModule } from '@shared/shared.module';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';
import { StoreModule } from '@ngrx/store';
import { LayerStyleService } from '../map/layers/layer-style.service';
import { ResultLayerService } from '../map/layers/result-layer.service';
import { CalculationService } from '@data/calculation/calculation.service';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { of } from 'rxjs';
import { TranslateLoader } from '@ngx-translate/core';
import { MetadataSelectors } from '@data/metadata';
import { CalculationSelectors } from '@data/calculation';
import { initialState as calculation } from '@data/calculation/calculation.reducers';
import { initialState as metadata } from '@data/metadata/metadata.reducers';
import { initialState as user } from '@data/user/user.reducers';

function makeDrop(previousIndex: number, currentIndex: number): CdkDragDrop<(BandLayerItem | ResultLayerItem)[]> {
  return { previousIndex, currentIndex } as CdkDragDrop<(BandLayerItem | ResultLayerItem)[]>;
}

function makeBandItem(bandNumber: number): BandLayerItem {
  return {
    kind: 'band',
    id: `eco-${bandNumber}`,
    name: `Band ${bandNumber}`,
    type: 'ECOSYSTEM',
    visible: true,
    band: {
      bandNumber,
      title: `Band ${bandNumber}`,
      symphonyCategory: 'ECOSYSTEM',
      selected: true,
      reliability: null,
      meta: {}
    }
  };
}

function makeResultItem(id: number): ResultLayerItem {
  return {
    kind: 'result',
    id: `result-${id}`,
    name: `Result ${id}`,
    visible: true,
    entry: {
      id,
      name: `Result ${id}`,
      layer: { getVisible: () => true } as any
    }
  };
}

describe('LayerManagerComponent', () => {
  let component: LayerManagerComponent;
  let fixture: ComponentFixture<LayerManagerComponent>;

  const mockLayerStyleService = {
    getOpacity: () => 1,
    getResultOpacity: () => 1,
    getBandVisibility: () => true,
    setOpacity: () => {},
    setResultOpacity: () => {},
    setBandVisibility: () => {},
    clearResultOpacity: () => {},
    reorderSecondaryLayers: jasmine.createSpy('reorderSecondaryLayers')
  };

  const mockResultLayerService = {
    results$: of([])
  };

  const mockCalculationService = {
    removeResultPixels: () => {}
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedModule, TranslationSetupModule, StoreModule.forRoot({}, {}), DragDropModule],
      declarations: [LayerManagerComponent, AutoSelectDirective],
      providers: [
        provideMockStore({
          initialState: { calculation, metadata, user },
          selectors: [
            { selector: MetadataSelectors.selectVisibleBands, value: { ecoComponent: [], pressureComponent: [] } },
            { selector: CalculationSelectors.selectCalculations, value: [] }
          ]
        }),
        { provide: LayerStyleService, useValue: mockLayerStyleService },
        { provide: ResultLayerService, useValue: mockResultLayerService },
        { provide: CalculationService, useValue: mockCalculationService },
        { provide: TranslateLoader, useValue: { getTranslation: () => of({}) } },
        provideZonelessChangeDetection()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LayerManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty secondary layer list', () => {
    expect(component.secondaryLayers).toEqual([]);
  });

  it('should toggle primary layer visibility', () => {
    const layer = component.primaryLayers[0];
    const initialVisible = layer.visible;
    component.toggleVisibility(layer);
    expect(layer.visible).toBe(!initialVisible);
  });

  it('should initialize primary layers without the scenario layer', () => {
    expect(component.primaryLayers.map(layer => layer.id)).toEqual(['background', 'user-areas']);
  });

  it('should only allow renaming result layers', () => {
    expect(component.isRenamable(makeResultItem(1))).toBe(true);
    expect(component.isRenamable(makeBandItem(1))).toBe(false);
    expect(component.isRenamable(component.primaryLayers[0])).toBe(false);
  });

  it('should not enter edit mode for primary layers', () => {
    const layer = component.primaryLayers[0];
    component.startEditing(layer);
    expect(component.editingLayerId).toBeNull();
  });

  it('should not enter edit mode for band layers', () => {
    component.startEditing(makeBandItem(1));
    expect(component.editingLayerId).toBeNull();
  });

  it('should enter and cancel edit mode', () => {
    const layer = makeResultItem(1);
    component.startEditing(layer);
    expect(component.editingLayerId).toBe(layer.id);
    expect(component.editingName).toBe(layer.name);
    component.cancelEditing();
    expect(component.editingLayerId).toBeNull();
    expect(component.editingName).toBe('');
  });

  it('should save a renamed layer locally', () => {
    const layer = makeResultItem(1);
    component.startEditing(layer);
    component.editingName = 'My Custom Name';
    component.saveLayerName(layer);
    expect(layer.name).toBe('My Custom Name');
    expect(component.editingLayerId).toBeNull();
  });

  it('should cancel editing when name is unchanged', () => {
    const layer = makeResultItem(1);
    component.startEditing(layer);
    component.editingName = layer.name;
    component.saveLayerName(layer);
    expect(component.editingLayerId).toBeNull();
  });

  it('should not rename when name is blank', () => {
    const layer = makeResultItem(1);
    const nameBefore = layer.name;
    component.startEditing(layer);
    component.editingName = '   ';
    component.saveLayerName(layer);
    expect(layer.name).toBe(nameBefore);
  });

  it('should save layer name on Enter key', () => {
    const layer = makeResultItem(1);
    component.startEditing(layer);
    component.editingName = 'New Name';
    component.onEditKeydown(new KeyboardEvent('keydown', { key: 'Enter' }), layer);
    expect(layer.name).toBe('New Name');
  });

  it('should cancel editing on Escape key', () => {
    const layer = makeResultItem(1);
    component.startEditing(layer);
    component.editingName = 'New Name';
    component.onEditKeydown(new KeyboardEvent('keydown', { key: 'Escape' }), layer);
    expect(component.editingLayerId).toBeNull();
  });

  describe('drop()', () => {
    beforeEach(() => {
      mockLayerStyleService.reorderSecondaryLayers.calls.reset();
    });

    it('should reorder secondaryLayers array when dropped', () => {
      const band1 = makeBandItem(1);
      const band2 = makeBandItem(2);
      const band3 = makeBandItem(3);
      component.secondaryLayers = [band1, band2, band3];

      component.drop(makeDrop(2, 0));

      expect(component.secondaryLayers).toEqual([band3, band1, band2]);
    });

    it('should call reorderSecondaryLayers with correct band payload', () => {
      const band = makeBandItem(5);
      component.secondaryLayers = [band];

      component.drop(makeDrop(0, 0));

      expect(mockLayerStyleService.reorderSecondaryLayers).toHaveBeenCalledOnceWith([
        { kind: 'band', type: 'ECOSYSTEM', bandNumber: 5 }
      ]);
    });

    it('should call reorderSecondaryLayers with correct result payload', () => {
      const result = makeResultItem(42);
      component.secondaryLayers = [result];

      component.drop(makeDrop(0, 0));

      expect(mockLayerStyleService.reorderSecondaryLayers).toHaveBeenCalledOnceWith([
        { kind: 'result', id: 42 }
      ]);
    });

    it('should call reorderSecondaryLayers with mixed layers in new order', () => {
      const band = makeBandItem(1);
      const result = makeResultItem(10);
      component.secondaryLayers = [band, result];

      // Move result to front
      component.drop(makeDrop(1, 0));

      expect(mockLayerStyleService.reorderSecondaryLayers).toHaveBeenCalledOnceWith([
        { kind: 'result', id: 10 },
        { kind: 'band', type: 'ECOSYSTEM', bandNumber: 1 }
      ]);
    });
  });
});
