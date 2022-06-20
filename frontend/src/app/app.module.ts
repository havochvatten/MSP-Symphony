import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import {
  HavCheckboxModule,
  HavButtonModule,
  HavAccordionModule,
  HavRadioButtonModule,
  HavCoreModule
} from 'hav-components';
import { environment } from '../environments/environment';
import { MapViewModule } from './map-view/map-view.module';
import { StoreModule } from '@ngrx/store';
import { reducers, metaReducers } from './app-reducer';
import { EffectsModule } from '@ngrx/effects';
import { MetadataEffects } from '@data/metadata/metadata.effects';
import { UserEffects } from '@data/user/user.effects';
import { AreaEffects } from '@data/area/area.effects';
import { TranslationSetupModule } from './app-translation-setup.module';
import { MessageEffects } from '@data/message/message.effects';
import { CalculationEffects } from '@data/calculation/calculation.effects';
import { ScenarioEffects } from "@data/scenario/scenario.effects";

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    HavCheckboxModule,
    HavButtonModule,
    HavRadioButtonModule,
    HavAccordionModule,
    SharedModule,
    HavCoreModule,
    CoreModule,
    MapViewModule,
    StoreModule.forRoot(reducers, {
      metaReducers,
      runtimeChecks: {
        strictStateImmutability: true,
        strictActionImmutability: true,
        strictStateSerializability: true,
        strictActionSerializability: true
      }
    }),
    EffectsModule.forRoot([
      MetadataEffects,
      UserEffects,
      AreaEffects,
      MessageEffects,
      CalculationEffects,
      ScenarioEffects
    ]),
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: environment.production }),
    TranslationSetupModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
