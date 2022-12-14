import { Group as LayerGroup } from 'ol/layer';
import { Collection } from 'ol';
import ImageLayer from 'ol/layer/Image';
import ImageStatic from 'ol/source/ImageStatic';
import BaseLayer from 'ol/layer/Base';
import { StaticImageOptions} from '@data/calculation/calculation.interfaces';
import RenderEvent from "ol/render/Event";

export class ResultLayerGroup extends LayerGroup {

  public antialias = true;
  private calculationLayers = new Map<number, ImageLayer>();

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
      cpl.on('postrender', this.renderHandler);
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

  public toggleImageSmoothing() {
    this.antialias = !this.antialias;
    this.changed();
  }

  public clearResult() {
    this.calculationLayers = new Map<number, ImageLayer>();
    this.setLayers(new Collection<BaseLayer>());
  }

  private renderHandler = (evt: RenderEvent) => evt.context.imageSmoothingEnabled = this.antialias;

}
