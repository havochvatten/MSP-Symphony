import { Group as LayerGroup } from 'ol/layer';
import { Collection } from 'ol';
import ImageLayer from 'ol/layer/Image';
import ImageStatic from 'ol/source/ImageStatic';
import BaseLayer from 'ol/layer/Base';
import { StaticImageOptions } from '@data/calculation/calculation.interfaces';
import RenderEvent from "ol/render/Event";

export class ResultLayerGroup extends LayerGroup {

  public antialias = true;

  // TODO Clip result to scenario boundaries? Perhaps like so:
  // https://gis.stackexchange.com/questions/185881/clipping-tilelayer-with-georeferenced-polygon-clipping-mask
  public addResult(result: StaticImageOptions) {
    const imageLayers = this.getLayers(),
          cpl = new ImageLayer({
            source: new ImageStatic(result)
          });

    cpl.on('postrender', this.renderHandler);
    imageLayers.push(cpl);
    this.setLayers(imageLayers);
  }

  public toggleImageSmoothing() {
    this.antialias = !this.antialias;
    this.changed();
  }

  public clearResult() {
    this.setLayers(new Collection<BaseLayer>());
  }

  private renderHandler = (evt: RenderEvent) => evt.context.imageSmoothingEnabled = this.antialias;

}
