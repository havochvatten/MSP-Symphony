import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { Map, View } from 'ol';
import Style from "ol/style/Style"
import { Polygon } from "ol/geom";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { getArea } from "ol/sphere";
import { getCenter } from "ol/extent";
import { Stroke } from "ol/style";
import { GeoJSON } from "ol/format";
import * as proj from "ol/proj";

@Directive({
  selector: 'app-inline-map',
})

export class InlineMapComponent implements OnInit {

  @Input() polygon!: any;
  @Input() vectorStyle = new Style({
    stroke: new Stroke({ width: 2, color: 'black'})
  });

  private map?: Map;
  private readonly domElement: HTMLElement;
  private readonly view = new View({ maxZoom: 9 })
  private readonly source = new VectorSource({ format : new GeoJSON({ featureProjection: 'EPSG:3857' }) });

  myPolygon() : Polygon  {
    return this.polygon as Polygon;
  }

  constructor(element: ElementRef) {
    this.domElement = element.nativeElement;
  }

  ngOnInit(): void {

    this.source.addFeatures(
      (this.source.getFormat() as GeoJSON).readFeatures(this.myPolygon())
    );
    const geometry = this.source.getFeatures()[0].getGeometry(),
          extent = geometry!.getExtent();
    this.view.setCenter(proj.fromLonLat(getCenter(extent)));

    this.map = new Map({
      controls: [], interactions: [],
      layers: [
        new TileLayer({ source: new OSM() }),
        new VectorLayer({
          source: this.source,
          style: this.vectorStyle
        })
      ],
      target: this.domElement,
      view: this.view,
    });

    this.map.getView().fit(extent, { padding: [10, 10, 10, 10] });
  }
}
