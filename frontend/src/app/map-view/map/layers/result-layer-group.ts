import { Collection } from 'ol';
import ImageLayer from 'ol/layer/Image';
import ImageStatic from 'ol/source/ImageStatic';
import BaseLayer from 'ol/layer/Base';
import { StaticImageOptions} from '@data/calculation/calculation.interfaces';
import Static from "ol/source/ImageStatic";
import { SymphonyLayerGroup } from "@src/app/map-view/map/layers/symphony-layer";
import RenderEvent from "ol/render/Event";

export class ResultLayerGroup extends SymphonyLayerGroup {

  private calculationLayers = new Map<number, ImageLayer<Static>>();

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
      cpl.on('prerender', this.renderHandler);
      imageLayers.push(cpl);
      this.setLayers(imageLayers);
    }
  }

  public removeResult(id : number) {
    const imageLayers = this.getLayers(),
          cl = this.calculationLayers.get(id);
    if(cl) {
      imageLayers.remove(cl);
    }
    this.setLayers(imageLayers);
  }

  public clearResult() {
    this.calculationLayers = new Map<number, ImageLayer<Static>>();
    this.setLayers(new Collection<BaseLayer>());
  }

}
