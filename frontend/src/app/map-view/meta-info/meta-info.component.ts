import { AfterViewInit, Component, ElementRef } from '@angular/core';
import { DialogRef } from "@shared/dialog/dialog-ref";
import { DialogConfig } from "@shared/dialog/dialog-config";
import { Band } from "@data/metadata/metadata.interfaces";
import { KeyValue } from "@angular/common";
import { environment as env } from '@src/environments/environment';

@Component({
  selector: 'app-meta-info',
  templateUrl: './meta-info.component.html',
  styleUrls: ['./meta-info.component.scss']
})
export class MetaInfoComponent implements AfterViewInit {

  private band: Band;
  public bandMetadata: Map<string, string[]> = new Map<string, string[]>();
  public bandMetadataLists: Map<string, string[]> = new Map<string, string[]>();
  public category: string;
  public title: string;

  constructor(private dialog: DialogRef, private config: DialogConfig,
              private container: ElementRef) {
    this.band = config.data.band;

    for (const metaField of env.meta.visible_fields) {
      let sep: string;
      if (this.band.meta[metaField]) {
        let listType = env.meta.list_fields.includes(metaField);
        sep = (listType) ? ';' : '\\n';
        (listType ? this.bandMetadataLists : this.bandMetadata)
          .set(metaField, this.band.meta[metaField].split(sep));
      }
    }

    this.category = this.band.statePath[0] === 'ecoComponent' ? 'ecosystem' : 'pressure';
    this.title = this.band.title;
  }

  close = () => {
    this.dialog.close();
  }

  preserveKV(a: KeyValue<string, string[]>, b: KeyValue<string, string[]>): number { return 0; }

  ngAfterViewInit(): void {
    if(this.container.nativeElement.scrollHeight > this.container.nativeElement.offsetHeight) {
      this.container.nativeElement.classList.add('has-overflow');
    }
  }
}
