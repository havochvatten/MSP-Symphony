import { CachedVectorLayers } from "@src/app/map-view/map/layers/cached-vectorlayers";
import Style from "ol/style/Style";
import { Fill } from "ol/style";
import GeoJSON from "ol/format/GeoJSON";
import { UncertaintyMapping } from "@data/metadata/metadata.interfaces";
import VectorImageLayer from "ol/layer/VectorImage";
import VectorSource from "ol/source/Vector";

const u_img_high = new Image(), u_img_mid = new Image();
u_img_high.src = 'assets/high-uncertainty.svg';
u_img_mid.src = 'assets/mid-uncertainty.svg';

class UncertaintyStyle extends Style {
  constructor(opaque: boolean, value: number) {
    const  ctx = (document.getElementById('utility-canvas') as HTMLCanvasElement).getContext('2d'),
      uc_pattern_high = ctx!.createPattern(u_img_high, 'repeat'),
      uc_pattern_mid = ctx!.createPattern(u_img_mid, 'repeat'),
      byteVal = ((value / 100) * 255) | 0;

    super(
    {
      fill: opaque ?
        new Fill({
        color: `rgba(255, ${ 255 - byteVal }, ${ 255 - byteVal }, 1)`}) :
        new Fill({
          color:
            value > 66 ?
              uc_pattern_high :
            value > 32 ?
              uc_pattern_mid :
              'rgba(0, 0, 0, 0)' })
    });
  }
}

export class UncertaintyLayer extends CachedVectorLayers {

  constructor(
    private uncertainty: {[key: number]:  UncertaintyMapping },
    private readonly opaque: boolean,
    geoJson: GeoJSON) {
    super(geoJson);

    this.mapUncertainty();
  }

  private mapUncertainty() {
    for (const bandNumber in this.uncertainty) {
      const uncertainty = this.uncertainty[bandNumber];
      for (const partition of uncertainty.partitions) {
        const layer = new VectorImageLayer({
          source: new VectorSource({
            format: this.geoJson,
            features: [this.geoJson.readFeature(partition.polygon)]
          }),
          style: new UncertaintyStyle(this.opaque, partition.value)
        });

        this.featureMap.set(`${bandNumber}_${partition.value}`, layer);
      }
    }
  }

  public highlightUncertainty(bandNumber: number): void {
    this.getLayers().clear();
    for (const [key, layer] of this.featureMap) {
      if (key.startsWith(`${bandNumber}_`)) {
        this.getLayers().push(layer);
      }
    }
  }

  public clear(): void {
    this.getLayers().clear();
  }
}
