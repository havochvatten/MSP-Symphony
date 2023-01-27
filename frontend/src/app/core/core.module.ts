import { SharedModule } from './../shared/shared.module';
import { HeaderComponent } from './header/header.component';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FooterComponent } from './footer/footer.component';
import { UserMenuToggleComponent } from './header/user-menu-toggle/user-menu-toggle.component';
import { AboutDialogComponent } from './about/about-dialog.component';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [HeaderComponent, FooterComponent, UserMenuToggleComponent, AboutDialogComponent],
  imports: [SharedModule, BrowserAnimationsModule, MatButtonModule],
  exports: [HeaderComponent, FooterComponent]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() coreModule: CoreModule) {
    if (coreModule) {
      throw new Error(
        'The CoreModule should only be imported in the AppModule.'
      );
    }
  }
}
