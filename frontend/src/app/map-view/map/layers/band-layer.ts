import { Layer } from 'ol/layer';
import { Band, BandType, HeatmapModel } from '@data/metadata/metadata.interfaces';
import ImageLayer from 'ol/layer/Image';
import { ImageStatic } from 'ol/source';
import { AppSettings } from '@src/app/app.settings';
import { StaticImageOptions } from '@data/calculation/calculation.interfaces';
import { DataLayerService } from '@src/app/map-view/map/layers/data-layer.service';
import ImageSource from 'ol/source/Image';
import { SymphonyLayerGroup } from "@src/app/map-view/map/layers/symphony-layer";
import RenderEvent from "ol/render/Event";
import { Store } from "@ngrx/store";
import { State } from "@src/app/app-reducer";
import { MetadataActions } from "@data/metadata";

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

  private loadedHeatmaps = {
    ECOSYSTEM: new Map<Exclude<HeatmapModel, 'none'>, Layer>(),
    PRESSURE: new Map<Exclude<HeatmapModel, 'none'>, Layer>()
  };

  private visibleHeatmaps = {
    ECOSYSTEM: 'none' as HeatmapModel,
    PRESSURE: 'none' as HeatmapModel
  };

  constructor(private baseline: string,
              private dataLayerService: DataLayerService,
              private store: Store<State>,
              antialias: boolean) {
    super();
    this.antialias = antialias;
  }

  protected renderHandler = (evt: RenderEvent) => (evt.context! as CanvasRenderingContext2D).imageSmoothingEnabled = this.antialias;

  public setVisibleHeatmap(bandType: BandType, model: HeatmapModel) {
    const loadedByType = this.loadedHeatmaps[bandType];
    const previousModel = this.visibleHeatmaps[bandType];

    console.info(`[Heatmap] setVisibleHeatmap - bandType: ${bandType}, model: ${model}, previous: ${previousModel}`);

    // Remove previous layer if needed
    if (previousModel !== 'none' && loadedByType.has(previousModel)) {
      const previousLayer = loadedByType.get(previousModel)!;
      if (this.getLayers().getArray().includes(previousLayer)) {
        this.getLayers().remove(previousLayer);
      }
    }

    this.visibleHeatmaps[bandType] = model;

    if (model === 'none') {
      console.info(`[Heatmap] Switching to 'none' - turning off loading`);
      this.store.dispatch(MetadataActions.setHeatmapLoading({ bandType, loading: false }));
      return;
    }

    // === Cached model (already loaded) ===
    if (loadedByType.has(model)) {
      console.info(`[Heatmap] Using cached model "${model}" - turning off loading`);
      const layer = loadedByType.get(model)!;
      if (!this.getLayers().getArray().includes(layer)) {
        this.getLayers().push(layer);
      }
      this.store.dispatch(MetadataActions.setHeatmapLoading({ bandType, loading: false }));
      return;
    }

    // === New model – start loading ===
    console.info(`[Heatmap] Loading new model "${model}" from backend`);
    this.store.dispatch(MetadataActions.setHeatmapLoading({ bandType, loading: true }));

    this.dataLayerService.getHeatmapLayer(this.baseline, bandType, model).subscribe({
      next: (response) => {
        console.info(`[Heatmap] HTTP response received for "${model}"`);

        const extentHeader = response.headers.get('SYM-Image-Extent');
        if (!extentHeader) {
          console.error("Heatmap image does not have any extent header, ignoring.");
          this.store.dispatch(MetadataActions.setHeatmapLoading({ bandType, loading: false }));
          return;
        }

        if (!response.body) {
          console.warn(`No body in heatmap response for "${model}"`);
          this.store.dispatch(MetadataActions.setHeatmapLoading({ bandType, loading: false }));
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

        if (this.visibleHeatmaps[bandType] === model) {
          this.getLayers().push(layer);
        }

        // === SUCCESS: turn off spinner ===
        console.info(`[Heatmap] Successfully loaded "${model}" - turning off loading`);
        this.store.dispatch(MetadataActions.setHeatmapLoading({ bandType, loading: false }));
      },
      error: (err) => {
        console.error(`[Heatmap] Failed to load heatmap "${model}":`, err);
        this.store.dispatch(MetadataActions.setHeatmapLoading({ bandType, loading: false }));
      }
    });
  }

  public setVisibleBands(bandType: BandType, bands: Band[]) {
    const ecoType = bandType === 'ECOSYSTEM',
          layerBands =
            ecoType ? this.loadedBands.ecoComponents : this.loadedBands.pressures,
          visibleBandNumbers =
            ecoType ? this.visibleBandNumbers.ecoComponents : this.visibleBandNumbers.pressures;

    // remove layers
    const bandNumbers = bands.map(band => band.bandNumber);

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
          this.dataLayerService.getDataLayer(this.baseline, type, band.bandNumber).subscribe(response => {
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
              this.setBandLayerOpacity(bandType, band.bandNumber, (band.layerOpacity ?? 100) / 100);
              this.store.dispatch(MetadataActions.setLoadedState({ band, value: true }));
              visibleBandNumbers.add(band.bandNumber);
            } else {
              console.error("Image for band " + band.bandNumber + " does not have any extent header ignoring.");
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
