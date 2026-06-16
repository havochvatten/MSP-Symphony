import { Layer } from 'ol/layer';
import { Band, BandType } from '@data/metadata/metadata.interfaces';
import ImageLayer from 'ol/layer/Image';
import { ImageStatic } from 'ol/source';
import { AppSettings } from '@src/app/app.settings';
import {
  StaticImageOptions,
  SummaryModel,
  SummaryModelCategory
} from '@data/calculation/calculation.interfaces';
import { DataLayerService } from '@src/app/map-view/map/layers/data-layer.service';
import ImageSource from 'ol/source/Image';
import { SymphonyLayerGroup } from '@src/app/map-view/map/layers/symphony-layer';
import RenderEvent from 'ol/render/Event';
import { Store } from '@ngrx/store';
import { State } from '@src/app/app-reducer';
import { MetadataActions } from '@data/metadata';
import { CalculationActions } from '@data/calculation';

class DataLayer extends ImageLayer<ImageSource> {
  constructor(opts: StaticImageOptions) {
    super({
      // TODO: It would be more convenient to make use of a tiled protocol here: => WM(T)S?
      source: new ImageStatic(opts)
    });
  }
}

class BandLayer extends SymphonyLayerGroup {
  private loadedBands = {
    ecoComponents: new Map<number, Layer>(),
    pressures: new Map<number, Layer>()
  };

  private visibleBandNumbers = {
    ecoComponents: new Set<number>(),
    pressures: new Set<number>()
  };

  private loadedSummaryModels = {
    ECOSYSTEM: new Map<Exclude<SummaryModel, 'none'>, Layer>(),
    PRESSURE: new Map<Exclude<SummaryModel, 'none'>, Layer>()
  };

  private visibleSummaryModels = {
    ECOSYSTEM: 'none' as SummaryModel,
    PRESSURE: 'none' as SummaryModel
  };

  constructor(
    private baseline: string,
    private dataLayerService: DataLayerService,
    private store: Store<State>,
    antialias: boolean
  ) {
    super();
    this.antialias = antialias;
  }

  protected renderHandler = (evt: RenderEvent) =>
    ((evt.context! as CanvasRenderingContext2D).imageSmoothingEnabled = this.antialias);

  public setVisibleSummaryModel(modelCategory: SummaryModelCategory, model: SummaryModel) {
    const loadedByType = this.loadedSummaryModels[modelCategory];
    const previousModel = this.visibleSummaryModels[modelCategory];

    // Remove previous layer if needed
    if (previousModel !== 'none' && loadedByType.has(previousModel)) {
      const previousLayer = loadedByType.get(previousModel)!;
      if (this.getLayers().getArray().includes(previousLayer)) {
        this.getLayers().remove(previousLayer);
      }
    }

    this.visibleSummaryModels[modelCategory] = model;

    if (model === 'none') {
      this.store.dispatch(CalculationActions.setSummaryModelLoading({ category: modelCategory, loading: false }));
      return;
    }

    // === Cached model (already loaded) ===
    if (loadedByType.has(model)) {
      const layer = loadedByType.get(model)!;
      if (!this.getLayers().getArray().includes(layer)) {
        this.getLayers().push(layer);
      }
      this.store.dispatch(CalculationActions.setSummaryModelLoading({ category: modelCategory, loading: false }));
      return;
    }

    // === New model – start loading ===
    this.store.dispatch(CalculationActions.setSummaryModelLoading({ category: modelCategory, loading: true }));

    this.dataLayerService.getSummaryModel(this.baseline, modelCategory, model).subscribe({
      next: (response) => {
        const extentHeader = response.headers.get('SYM-Image-Extent');
        if (!extentHeader) {
          console.error('SummaryModel image does not have any extent header, ignoring.');
          this.store.dispatch(CalculationActions.setSummaryModelLoading({ category: modelCategory, loading: false }));
          return;
        }

        if (!response.body) {
          console.warn(`No body in summary model response for "${model}"`);
          this.store.dispatch(CalculationActions.setSummaryModelLoading({ category: modelCategory, loading: false }));
          return;
        }

        const imageOpts = {
          url: URL.createObjectURL(response.body),
          imageExtent: JSON.parse(extentHeader),
          calculationId: NaN,
          projection: AppSettings.MAP_PROJECTION,
          attributions: '',
          interpolate: this.antialias
        };

        const layer = new DataLayer(imageOpts);
        loadedByType.set(model, layer);
        layer.on('prerender', this.renderHandler);

        if (this.visibleSummaryModels[modelCategory] === model) {
          this.getLayers().push(layer);
        }

        // === SUCCESS: turn off spinner ===
        this.store.dispatch(CalculationActions.setSummaryModelLoading({ category: modelCategory, loading: false }));
      },
      error: (err) => {
        console.error(`Failed to load summary model: "${model}":`, err);
        this.store.dispatch(CalculationActions.setSummaryModelLoading({ category: modelCategory, loading: false }));
      }
    });
  }

  public setVisibleBands(bandType: BandType, bands: Band[]) {
    const ecoType = bandType === 'ECOSYSTEM',
      layerBands = ecoType ? this.loadedBands.ecoComponents : this.loadedBands.pressures,
      visibleBandNumbers = ecoType
        ? this.visibleBandNumbers.ecoComponents
        : this.visibleBandNumbers.pressures;

    // remove layers
    const bandNumbers = bands.map((band) => band.bandNumber);

    layerBands.forEach((layer: Layer, bandNumber: number) => {
      if (!bandNumbers.includes(bandNumber)) {
        this.getLayers().remove(layer);
        visibleBandNumbers.delete(bandNumber);
      }
    });

    // add layers
    bands.forEach((band: Band) => {
      if (!visibleBandNumbers.has(band.bandNumber)) {
        // already loaded layers don't require fetching
        if (layerBands.has(band.bandNumber)) {
          const layer = layerBands.get(band.bandNumber)!;
          if (!this.getLayers().getArray().includes(layer)) {
            // guard necessary due oddity in OpenLayers collections impl. Could be a bug?
            // Opting for a simple if branch here over a verbose try-catch block.
            // https://github.com/openlayers/openlayers/blob/f2c05afbd128428035f51945bbc74dc00aeaed7b/src/ol/Collection.js#L319
            this.getLayers().push(layer);
          }
        } else {
          const type = layerBands === this.loadedBands.ecoComponents ? 'ECOSYSTEM' : 'PRESSURE';
          this.dataLayerService
            .getDataLayer(this.baseline, type, band.bandNumber)
            .subscribe((response) => {
              const extentHeader = response.headers.get('SYM-Image-Extent');
              if (extentHeader) {
                if (!response.body) {
                  return;
                }
                const imageOpts = {
                  url: URL.createObjectURL(response.body),
                  imageExtent: JSON.parse(extentHeader),
                  calculationId: NaN,
                  projection: AppSettings.MAP_PROJECTION,
                  attributions: band.meta.mapAcknowledgement ?? band.meta.authorOrganisation ?? '',
                  interpolate: this.antialias
                };

                const layer = new DataLayer(imageOpts);
                this.getLayers().push(layer);
                layerBands.set(band.bandNumber, layer);
                layer.on('prerender', this.renderHandler);
                this.setBandLayerOpacity(
                  bandType,
                  band.bandNumber,
                  (band.layerOpacity ?? 100) / 100
                );
                this.store.dispatch(MetadataActions.setLoadedState({ band, value: true }));
                visibleBandNumbers.add(band.bandNumber);
              } else {
                console.error(
                  'Image for band ' + band.bandNumber + ' does not have any extent header, ignoring.'
                );
              }
            });
        }
      }
    });
  }

  private setBandLayerOpacity(type: BandType, layerNumber: number, opacity: number) {
    if (type === 'ECOSYSTEM') {
      this.loadedBands.ecoComponents.get(layerNumber)!.setOpacity(opacity);
    } else {
      this.loadedBands.pressures.get(layerNumber)!.setOpacity(opacity);
    }
  }
}

export default BandLayer;
