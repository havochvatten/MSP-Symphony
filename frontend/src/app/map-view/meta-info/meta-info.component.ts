import { Component } from '@angular/core';
import { DialogRef } from "@shared/dialog/dialog-ref";
import { DialogConfig } from "@shared/dialog/dialog-config";
import { Band } from "@data/metadata/metadata.interfaces";
import { KeyValue } from "@angular/common";

@Component({
  selector: 'app-meta-info',
  templateUrl: './meta-info.component.html',
  styleUrls: ['./meta-info.component.scss']
})
export class MetaInfoComponent {

  private band: Band;
  public bandMetadataSources: string[];
  public bandMetadata: Map<string, string>;
  public category: string;
  public title: string;

  constructor(private dialog: DialogRef, private config: DialogConfig) {
    this.band = config.data.band;
    this.bandMetadata = new Map<string, string> ([
      ['method-summary',     this.band.methodSummary],
      ['known-limitations',  this.band.limitationsForSymphony],
      ['value-range',        this.band.valueRange],
      ['data-processing',    this.band.dataProcessing]
    ]);
    this.bandMetadataSources = this.band.dataSources?.split(';') || [];
    this.category = this.band.statePath[0] === 'ecoComponent' ? 'ecosystem' : 'pressure';
    this.title = this.band.title;
  }

  close = () => {
    this.dialog.close();
  }

  preserveKV(a: KeyValue<string, string>, b: KeyValue<string, string>): number { return 0; }
}
