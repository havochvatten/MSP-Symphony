import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '@src/app/core/core.module';
import { PublicView } from './public-view/public-view.component';
import { SharedModule } from '../shared/shared.module';
import { MapViewModule } from '../map-view/map-view.module';
import { PublicMapComponent } from './public-map/public-map.component';

@NgModule({
  declarations: [PublicView, PublicMapComponent],
  imports: [CommonModule, CoreModule, SharedModule, MapViewModule]
})
export class PublicViewModule {}
