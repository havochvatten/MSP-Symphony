import { Component } from '@angular/core';
import { SelectIntersectionComponent } from "@shared/select-intersection/select-intersection.component";
import { DialogRef } from "@shared/dialog/dialog-ref";
import { DialogConfig } from "@shared/dialog/dialog-config";

@Component({
  selector: 'app-merge-areas-modal',
  templateUrl: './merge-areas-modal.component.html',
  styleUrls: ['../../../shared/select-intersection/select-intersection.component.scss',
              './merge-areas-modal.component.scss']
})
export class MergeAreasModalComponent extends SelectIntersectionComponent {

  altAreas: { index: number, name: string }[];

  constructor(dialog: DialogRef, conf: DialogConfig) {
    conf.data.headerTextKey   = 'map.merge-areas.modal.header';
    conf.data.confirmTextKey  = 'map.merge-areas.modal.confirm';
    conf.data.projection      = 'EPSG:4326';
    conf.data.reprojection    = 'EPSG:3857';

    const altAreas = [];

    for(const p_ix in conf.data.paths) {
      if(conf.data.paths[p_ix][0] === 'userArea') {
        altAreas.push({ index:     parseInt(p_ix) + 1,
                        name:      conf.data.names[p_ix] });
      }
    }
    conf.data.messageTextKey  =
      altAreas.length > 0 ?
        'map.merge-areas.modal.message-alts' :
        'map.merge-areas.modal.message';
    super(dialog, conf);
    this.altAreas = altAreas;
    this.selected = altAreas.length > 0 ? -1 : 0;
  }
}
