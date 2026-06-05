import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BandType } from '@data/metadata/metadata.interfaces';

@Injectable({ providedIn: 'root' })
export class LayerStyleService {

  // Opacity state for both bands and results, keyed by:
  //   bands:   `${type.toLowerCase()}-${bandNumber}`  e.g. "ecosystem-3"
  //   results: `result-${calculationId}`              e.g. "result-42"

  private opacityMap = new Map<string, number>();
  private opacitySubject = new BehaviorSubject<Map<string, number>>(new Map());

  private visibilityMap = new Map<string, boolean>();
  private visibilitySubject = new BehaviorSubject<Map<string, boolean>>(new Map());

  private zIndexMap = new Map<string, number>();
  private zIndexSubject = new BehaviorSubject<Map<string, number>>(new Map());

  private bandKey(type: BandType, bandNumber: number): string {
    return `${type.toLowerCase()}-${bandNumber}`;
  }

  private resultKey(id: number): string {
    return `result-${id}`;
  }

  // --- Bands ---

  setOpacity(type: BandType, bandNumber: number, opacity: number): void {
    this.opacityMap.set(this.bandKey(type, bandNumber), opacity);
    this.opacitySubject.next(new Map(this.opacityMap));
  }

  getOpacity(type: BandType, bandNumber: number): number {
    return this.opacityMap.get(this.bandKey(type, bandNumber)) ?? 1;
  }

  getOpacityChanges(): Observable<Map<string, number>> {
    return this.opacitySubject.asObservable();
  }

  setBandVisibility(type: BandType, bandNumber: number, visible: boolean): void {
    this.visibilityMap.set(this.bandKey(type, bandNumber), visible);
    this.visibilitySubject.next(new Map(this.visibilityMap));
  }

  getBandVisibility(type: BandType, bandNumber: number): boolean {
    return this.visibilityMap.get(this.bandKey(type, bandNumber)) ?? true;
  }

  getVisibilityChanges(): Observable<Map<string, boolean>> {
    return this.visibilitySubject.asObservable();
  }

  // --- Results ---

  setResultOpacity(id: number, opacity: number): void {
    this.opacityMap.set(this.resultKey(id), opacity);
    this.opacitySubject.next(new Map(this.opacityMap));
  }

  getResultOpacity(id: number): number {
    return this.opacityMap.get(this.resultKey(id)) ?? 1;
  }

  clearResultOpacity(id: number): void {
    this.opacityMap.delete(this.resultKey(id));
    this.opacitySubject.next(new Map(this.opacityMap));
  }

  // --- Z-Index / Layer Order ---

  getZIndexChanges(): Observable<Map<string, number>> {
    return this.zIndexSubject.asObservable();
  }

  reorderSecondaryLayers(orderedItems: Array<
    { kind: 'band'; type: BandType; bandNumber: number } |
    { kind: 'result'; id: number }
  >): void {
    const baseZIndex = 100;
    const count = orderedItems.length;
    orderedItems.forEach((item, index) => {
      const key = item.kind === 'band'
        ? this.bandKey(item.type, item.bandNumber)
        : this.resultKey(item.id);
      this.zIndexMap.set(key, baseZIndex + (count - 1 - index));
    });
    this.zIndexSubject.next(new Map(this.zIndexMap));
  }
}
