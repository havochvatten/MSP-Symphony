import { environment as env } from '@src/environments/environment';
import { Layer } from 'ol/layer';
import { Band, BandType } from '@data/metadata/metadata.interfaces';
import ImageLayer from "ol/layer/Image";
import LayerGroup from 'ol/layer/Group';
import { ImageStatic } from "ol/source";
import { HttpParams } from "@angular/common/http";
import { AppSettings } from "@src/app/app.settings";

class DataLayer extends ImageLayer {
  constructor(type: BandType, band: number, baseline: string) {
    super({
      source: new ImageStatic({
        url: `${env.apiBaseUrl}/datalayer/${type.toLowerCase()}/${band}/${baseline}`,
        // FIXME get extent from SYM-Image-Extent header
        imageExtent: [1115804.6918490308,7286602.962107685,2706071.7920658183,9998112.500325538]
      })
    });
  }
}

class BandLayer extends LayerGroup {
  private visibleBands = {
    ecoComponents: new Map<number, Layer>(),
    pressures: new Map<number, Layer>()
  };

  constructor(private baseline: string) {
    super();
  }

  private setBandLayerOpacity(type: BandType, layerNumber: number, opacity: number) {
    if (type === 'ECOSYSTEM') {
      this.visibleBands.ecoComponents.get(layerNumber)!.setOpacity(opacity);
    } else {
      this.visibleBands.pressures.get(layerNumber)!.setOpacity(opacity);
    }
  }

  private setVisibleBands(bandType: BandType, bandNumbers: number[]) {
    const layerBands =
      bandType === 'ECOSYSTEM' ? this.visibleBands.ecoComponents : this.visibleBands.pressures;
    // remove layers
    layerBands.forEach((layer: Layer, bandNumber: number) => {
      if (!bandNumbers.includes(bandNumber)) {
        if (this.getLayers().remove(layer)) layerBands.delete(bandNumber);
      }
    });

    // add layers
    bandNumbers.forEach((bandNumber: number) => {
      if (!layerBands.get(bandNumber)) {
        // const type = layerBands === this.visibleBands.ecoComponents ? 'ECOSYSTEM' : 'PRESSURE';
        // const url = `${env.apiBaseUrl}/datalayer/${type.toLowerCase()}/${bandNumber}/${this.baseline}`;
        // const params = new HttpParams().set('crs', AppSettings.MAP_PROJECTION);
        // this.http.get(url, {
        //   responseType: 'blob',
        //   observe: 'response',
        //   params
        // });
        // make request to get extent header here...
        const layer =
          layerBands === this.visibleBands.ecoComponents // not so pretty, but..
            ? new DataLayer('ECOSYSTEM', bandNumber, this.baseline)
            : new DataLayer('PRESSURE', bandNumber, this.baseline);

        this.getLayers().push(layer);
        layerBands.set(bandNumber, layer);
      }
    });
  }

  private setLayerOpacities(bandType: BandType, bands: Band[]) {
    bands.forEach((property: Band) => {
      const { bandNumber, layerOpacity = 100 } = property;
      this.setBandLayerOpacity(bandType, bandNumber, layerOpacity / 100);
    });
  }

  public updateLayers(bandType: BandType, bands: Band[]) {
    const bandNumbers = bands.map((band: Band) => band.bandNumber);
    this.setVisibleBands(bandType, bandNumbers);
    this.setLayerOpacities(bandType, bands);
  }
}

export default BandLayer;
