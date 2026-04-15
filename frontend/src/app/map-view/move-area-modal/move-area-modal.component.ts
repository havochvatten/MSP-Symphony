import { Component } from '@angular/core';
import { DialogRef } from '@shared/dialog/dialog-ref';
import { DialogConfig } from '@shared/dialog/dialog-config';

@Component({
  selector: 'app-move-area-modal',
  styleUrls: ['./move-area-modal.component.scss'],
  template: `
    <h3>{{ 'map.user-area.move.header' | translate }}</h3>
  <select [(ngModel)]="selectedCategoryId" style="margin-bottom: 16px; display: block; width: 100%; padding: 8px;">
    <option [ngValue]="null">Okategoriserad</option>
    <option *ngFor="let cat of categories" [ngValue]="cat.id">
      {{ cat.name }}
    </option>
  </select>
  <div style="margin-top: 16px;">
    <button mat-flat-button color="warn" (click)="cancel()">
      {{ 'controls.close' | translate }}
    </button>
    <button mat-flat-button (click)="save()">
      {{ 'controls.save' | translate }}
    </button>
  </div>
  `
})
export class MoveAreaModalComponent {
  selectedCategoryId: number | null = null;
  categories: { id: number; name: string }[] = [];

  constructor(
    private dialog: DialogRef,
    private config: DialogConfig
  ) {
    this.categories = config.data.categories;
    this.selectedCategoryId = config.data.currentCategoryId;
  }

  save() {
    this.dialog.close(this.selectedCategoryId);
  }

  cancel() {
    this.dialog.close();
  }
}
