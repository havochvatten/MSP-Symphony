import { Group as LayerGroup } from 'ol/layer';
import { Map as OLMap, Collection } from 'ol';
import ImageLayer from 'ol/layer/Image';
import ImageStatic from 'ol/source/ImageStatic';
import BaseLayer from 'ol/layer/Base';
import { StaticImageOptions } from '@data/calculation/calculation.interfaces';

export class ResultLayerGroup extends LayerGroup {
  // TODO Clip result to scenario boundaries? Perhaps like so:
  // https://gis.stackexchange.com/questions/185881/clipping-tilelayer-with-georeferenced-polygon-clipping-mask
  public addResult(result: StaticImageOptions) {
    const imageLayers = this.getLayers();
    imageLayers.push(
      // Fetch tiles instead to more easily parallelize the computation on the server side?
      new ImageLayer({
        source: new ImageStatic(result)
      })
    );
    this.setLayers(imageLayers);
  }

  public clearResult() {
    this.setLayers(new Collection<BaseLayer>());
  }
}
