import { Component } from '@angular/core';
import { DialogRef } from "@shared/dialog/dialog-ref";
import { AreaOverlapFragment } from "@src/app/map-view/scenario/scenario-detail/matrix-selection/matrix.interfaces";
import { DialogConfig } from "@shared/dialog/dialog-config";
import { getArea } from "ol/sphere";
import { Polygon } from "ol/geom";

@Component({
  selector: 'app-select-intersection',
  templateUrl: './select-intersection.component.html',
  styleUrls: ['./select-intersection.component.scss']
})
export class SelectIntersectionComponent {

  overlap : AreaOverlapFragment[];
  selected = -1;

  constructor( private dialog: DialogRef,
               private conf: DialogConfig ) {
    this.overlap = conf.data.overlap;
  }

  public squareKm(geometry: any): number {

    // First, check for MultiPolygon geometries
    const coords = (typeof geometry.coordinates[0][0][0] === "number") ?
      [geometry.coordinates] : geometry.coordinates,
      wgs = { projection: 'EPSG:4326'};
    let measure = 0;

    for (const c of coords) {
      measure += getArea(new Polygon(c), wgs);
    }

    return Math.round((measure / 1000000) * 100) / 100;
  }

  close() {
    this.dialog.close(-1);
  }

  confirm() {
    this.dialog.close(this.selected);
  }

  selectArea(index: number) {
    this.selected = index;
  }
}
