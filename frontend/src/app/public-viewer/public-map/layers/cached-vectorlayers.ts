import LayerGroup from "ol/layer/Group";
import VectorImageLayer from "ol/layer/VectorImage";
import Feature from "ol/Feature";
import { Geometry } from "ol/geom";
import GeoJSON from "ol/format/GeoJSON";
import VectorSource from "ol/source/Vector";

export abstract class CachedVectorLayers extends LayerGroup {
  protected featureMap = new Map<string, VectorImageLayer<VectorSource<Feature<Geometry>>>>();

  constructor(
    protected geoJson: GeoJSON
  ) {
    super();
  }
}
