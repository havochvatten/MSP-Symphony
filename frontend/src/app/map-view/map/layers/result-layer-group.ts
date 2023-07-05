import { Collection } from 'ol';
import ImageLayer from 'ol/layer/Image';
import ImageStatic from 'ol/source/ImageStatic';
import BaseLayer from 'ol/layer/Base';
import { StaticImageOptions} from '@data/calculation/calculation.interfaces';
import Static from "ol/source/ImageStatic";
import { SymphonyLayerGroup } from "@src/app/map-view/map/layers/symphony-layer";
import { MapComponent } from "@src/app/map-view/map/map.component";
import { AppSettings } from "@src/app/app.settings";

export class ResultLayerGroup extends SymphonyLayerGroup {

  private calculationLayers = new Map<number, ImageLayer<Static>>();

  private resetOptions(image: ImageStatic, calcId: number): StaticImageOptions {
    return {
      url: image.getUrl(),
      imageExtent: image.getImageExtent(),
      projection: AppSettings.CLIENT_SIDE_PROJECTION ?
        AppSettings.DATALAYER_RASTER_CRS :
        AppSettings.MAP_PROJECTION,
      calculationId: calcId,
      interpolate: this.antialias
    };
  }

  constructor(private map: MapComponent) { super(); }

  // TODO Clip result to scenario boundaries? Perhaps like so:
  // https://gis.stackexchange.com/questions/185881/clipping-tilelayer-with-georeferenced-polygon-clipping-mask
  public addResult(result: StaticImageOptions) {
    const imageLayers = this.getLayers(),
          cpl = new ImageLayer({
            source: new ImageStatic(result)
          });
    const cl = this.calculationLayers.get(result.calculationId);

    // Comparison layers use a dummy negative number obtained
    // by concatenating the respective calculation ids.
    // This way we may utilize the same method to render both
    // types of results.

    if(!isNaN(result.calculationId)  && !cl) {
      this.calculationLayers.set(result.calculationId, cpl);
      imageLayers.push(cpl);
      this.setLayers(imageLayers);
    }

    this.layerChange();
  }

  public removeResult(id : number) {
    const imageLayers = this.getLayers(),
          cl = this.calculationLayers.get(id);
    if(cl) {
      imageLayers.remove(cl);
    }
    this.setLayers(imageLayers);
    this.layerChange();
  }

  public clearResult() {
    this.calculationLayers = new Map<number, ImageLayer<Static>>();
    this.setLayers(new Collection<BaseLayer>());
    this.layerChange();
  }

  private layerChange() {
    const layerIds = [...this.calculationLayers.keys()];
    this.map.emitLayerChange(layerIds.filter(layerId => layerId > 0).length,
                             layerIds.filter(layerId => layerId < 0).length);
  }

  public toggleImageSmoothing(aliasing: boolean) {
    super.toggleImageSmoothing(aliasing);

    const layers : ImageLayer<ImageStatic>[] = [];
    this.calculationLayers.forEach((layer: ImageLayer<Static>, calcId) => {
      const chgLayer = new ImageLayer({
        source: new ImageStatic(this.resetOptions(layer.getRenderSource() as ImageStatic, calcId))
      });
      this.calculationLayers.set(calcId, chgLayer);
      layers.push(chgLayer);
    });
    this.setLayers(new Collection(layers));
    this.changed();
  }
}
