import { CachedVectorLayers } from "@src/app/map-view/map/layers/cached-vectorlayers";
import Style from "ol/style/Style";
import { Fill } from "ol/style";
import GeoJSON from "ol/format/GeoJSON";
import { ReliabilityMapping } from "@data/metadata/metadata.interfaces";
import VectorImageLayer from "ol/layer/VectorImage";
import VectorSource from "ol/source/Vector";

const u_img_low = new Image(), u_img_mid = new Image();
u_img_low.src = 'assets/low-reliability.svg';
u_img_mid.src = 'assets/mid-reliability.svg';

class ReliabilityStyle extends Style {
  constructor(opaque: boolean, value: number) {
    const  ctx = (document.getElementById('utility-canvas') as HTMLCanvasElement).getContext('2d'),
      uc_pattern_high = ctx!.createPattern(u_img_low, 'repeat'),
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

export class ReliabilityLayer extends CachedVectorLayers {

  constructor(
    private reliability: {[key: number]:  ReliabilityMapping },
    private readonly opaque: boolean,
    geoJson: GeoJSON) {
    super(geoJson);

    this.mapReliability();
  }

  private mapReliability() {
    for (const bandNumber in this.reliability) {
      const reliability = this.reliability[bandNumber];
      for (const partition of reliability.partitions) {
        const layer = new VectorImageLayer({
          source: new VectorSource({
            format: this.geoJson,
            features: [this.geoJson.readFeature(partition.polygon)]
          }),
          style: new ReliabilityStyle(this.opaque, partition.value)
        });

        this.featureMap.set(`${bandNumber}_${partition.value}`, layer);
      }
    }
  }

  public highlightReliability(bandNumber: number): void {
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
