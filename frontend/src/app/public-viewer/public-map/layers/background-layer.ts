import { Group as LayerGroup, Tile as TileLayer } from "ol/layer";
import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";
import { environment as env } from "@src/environments/environment";
import TileWMS from "ol/source/TileWMS";

export type MapType = 'OpenSeaMap' | 'Gebco' | 'HaV';

export class BackgroundLayer extends LayerGroup {
  constructor(mapType: MapType) {
    super({
      layers:
        mapType === 'OpenSeaMap'
          ? [
            new TileLayer({
              source: new OSM()
            }),
            new TileLayer({
              source: new XYZ({
                url: env.backgroundMap.openSeaMap.url
              })
            }),
            // new TileLayer({
            //   source: new TileWMS(env.backgroundMap.openSeaMap.marineProfile)
            // })
          ]
          : [
            new TileLayer({
              source: new TileWMS(env.backgroundMap.gebco)
            })
          ]
    });
  }
}
