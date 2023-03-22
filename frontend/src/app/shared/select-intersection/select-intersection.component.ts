import { Component } from '@angular/core';
import { DialogRef } from "@shared/dialog/dialog-ref";
import { AreaSelectionConfig } from "@shared/select-intersection/select-intersection.interfaces";
import { DialogConfig } from "@shared/dialog/dialog-config";
import { getArea } from "ol/sphere";
import { Polygon } from "ol/geom";

@Component({
  selector: 'app-select-intersection',
  templateUrl: './select-intersection.component.html',
  styleUrls: ['./select-intersection.component.scss']
})
export class SelectIntersectionComponent {

  areas : AreaSelectionConfig[];
  selected: number;
  multiselect: boolean[];
  multi: boolean
  headerTextKey: string;
  messageTextKey: string;
  confirmTextKey: string;
  cancelTextKey: string;
  projection: string;
  reprojection: string;
  metaDescriptionTextKey: string | null;

  constructor( private dialog: DialogRef,
               private conf: DialogConfig ) {
    this.areas                  = conf.data.areas;
    this.multi                  = conf.data.multi;
    this.headerTextKey          = conf.data.headerTextKey;
    this.messageTextKey         = conf.data.messageTextKey;
    this.confirmTextKey         = conf.data.confirmTextKey  || 'confirmation-modal.confirm'
    this.cancelTextKey          = conf.data.cancelTextKey   || 'confirmation-modal.cancel';
    this.metaDescriptionTextKey = conf.data.metaDescriptionTextKey || null;
    this.projection             = conf.data.projection    || 'EPSG:3857';
    this.reprojection           = conf.data.reprojection  || 'EPSG:4326';
    this.selected               = -1;
    this.multiselect  = Array(this.areas.length).fill(false);
  }

  public squareKm(geometry: any): number {

    // First, check for MultiPolygon geometries
    const coords = (typeof geometry.coordinates[0][0][0] === "number") ?
      [geometry.coordinates] : geometry.coordinates,
      wgs = { projection: this.reprojection };
    let measure = 0;

    for (const c of coords) {
      measure += getArea(new Polygon(c), wgs);
    }

    return Math.round((measure / 1000000) * 100) / 100;
  }

  close() {
    this.dialog.close(this.multi ? [false] : -1);
  }

  confirm() {
    this.dialog.close(
      this.multi ?
        (this.areas.length > 1 ?
          this.multiselect : [true]) :
        this.selected);
  }

  multiAcc(a:boolean, b:boolean) : boolean {
    return a || b;
  }

  selectMulti(index: number, event: Event) {
    this.multiselect[index] = !this.multiselect[index];
    event.stopPropagation();
    event.preventDefault();
  }

  select(index: number): void {
      this.selected = index;
  }
}
