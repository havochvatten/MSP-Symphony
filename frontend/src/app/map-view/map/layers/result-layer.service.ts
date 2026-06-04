import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import ImageLayer from 'ol/layer/Image';
import Static from 'ol/source/ImageStatic';

export interface ResultEntry {
  id: number;
  name: string;
  layer: ImageLayer<Static>;
}

@Injectable({ providedIn: 'root' })
export class ResultLayerService {

  private entries: ResultEntry[] = [];
  private entriesSubject = new BehaviorSubject<ResultEntry[]>([]);
  public results$: Observable<ResultEntry[]> = this.entriesSubject.asObservable();

  add(entry: ResultEntry): void {
    if (!this.entries.find(e => e.id === entry.id)) {
      this.entries.push(entry);
      this.entriesSubject.next([...this.entries]);
    }
  }

  remove(id: number): void {
    this.entries = this.entries.filter(e => e.id !== id);
    this.entriesSubject.next([...this.entries]);
  }

  clear(): void {
    this.entries = [];
    this.entriesSubject.next([]);
  }
}
