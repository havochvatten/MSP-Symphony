import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { Map, View } from 'ol';
import Style from "ol/style/Style"
import { Polygon } from "ol/geom";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { getCenter } from "ol/extent";
import { Stroke } from "ol/style";
import { GeoJSON } from "ol/format";
import * as proj from "ol/proj";

@Directive({
  selector: '[appInlineMap]',
})

export class InlineMapComponent implements OnInit {

  @Input() backgroundMap = true;
  @Input() projectionId = 'EPSG:3857';
  @Input() maxZoom = Infinity;
  @Input() padding: number | number[] = 10;
  @Input() polygon!: unknown;
  @Input() vectorStyle = new Style({
    stroke: new Stroke({ width: 2, color: 'black'})
  });

  private readonly domElement: HTMLElement;

  myPolygon() : Polygon  {
    return this.polygon as Polygon;
  }

  constructor(element: ElementRef) {
    this.domElement = element.nativeElement;
  }

  ngOnInit(): void {

    const fmt = new GeoJSON({ featureProjection: this.projectionId }),
          source = new VectorSource({ format : fmt }),
          view = new View({ maxZoom: this.maxZoom });

    source.addFeatures(
      fmt.readFeatures(this.myPolygon())
    );
    const geometry = source.getFeatures()[0].getGeometry(),
          extent = geometry!.getExtent();

    view.setCenter(proj.fromLonLat(getCenter(extent)));

    const map = new Map({
      controls: [], interactions: [],
      layers: [
        new VectorLayer({
          source: source,
          style: this.vectorStyle
        })
      ],
      target: this.domElement,
      view: view,
    });

    if(this.backgroundMap) {
      map.getLayers().insertAt(0, new TileLayer({ source: new OSM() }));
    }

    map.getView().fit(extent,
      { padding: typeof this.padding === 'number' ?
                  Array(4).fill(this.padding) :
                  this.padding }
    );
  }
}
