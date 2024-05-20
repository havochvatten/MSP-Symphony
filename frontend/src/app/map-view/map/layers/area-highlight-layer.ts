import VectorSource from "ol/source/Vector";
import { Map as OLMap } from "ol";
import GeoJSON from "ol/format/GeoJSON";
import { FeatureCollection, StatePath } from "@data/area/area.interfaces";
import Style from "ol/style/Style";
import { Fill, Stroke } from "ol/style";
import LayerGroup from "ol/layer/Group";
import VectorImageLayer from "ol/layer/VectorImage";
import { simpleHash } from "@shared/common.util";
import Feature from "ol/Feature";

export class AreaHighlightLayer extends LayerGroup {

  private featureMap = new Map<string, VectorImageLayer<Feature>>();
  private highlightStyle = new Style({
    stroke: new Stroke({
      color: 'red',
      width: 1
    }),
    fill: new Fill({
      color: 'transparent'
    })
  });

  constructor(
    private map: OLMap,
    private geoJson: GeoJSON
  ) {
    super();
  }

  public mapAreaLayers(areaFeatures: FeatureCollection[]): void {
    for(const feature of areaFeatures) {
      // filter empty features
      const validFeatures = feature.features.filter((f) =>
        Array.isArray(f.geometry.coordinates) && f.geometry.coordinates.length > 0);
      for(const validFeature of validFeatures) {
        const layer = new VectorImageLayer({
          source: new VectorSource({
            format: this.geoJson,
            features: [this.geoJson.readFeature(validFeature)]
          }),
          style: this.highlightStyle });

        this.featureMap.set(simpleHash(validFeature.properties.statePath), layer);
      }
    }
  }

  public highlightArea(statePath: StatePath): void {
    const layer = this.featureMap.get(simpleHash(statePath));
    if(layer) {
      this.getLayers().clear();
      this.getLayers().push(layer);
    }
  }

  public clearHighlight(statePath: StatePath): void {
    const layer = this.featureMap.get(simpleHash(statePath));
    if(layer) {
      this.getLayers().remove(layer);
    }
  }
}
