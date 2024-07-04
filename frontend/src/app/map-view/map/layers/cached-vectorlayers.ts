import LayerGroup from "ol/layer/Group";
import VectorImageLayer from "ol/layer/VectorImage";
import Feature from "ol/Feature";
import GeoJSON from "ol/format/GeoJSON";

export abstract class CachedVectorLayers extends LayerGroup {
  protected featureMap = new Map<string, VectorImageLayer<Feature>>();

  constructor(
    protected geoJson: GeoJSON
  ) {
    super();
  }
}
