import { NgModule } from '@angular/core';
import { TranslatePipe, provideTranslateService } from '@ngx-translate/core';

/** Spec setup for ngx-translate: provides TranslateService and the translate pipe. */
@NgModule({
  imports: [TranslatePipe],
  providers: [provideTranslateService()],
  exports: [TranslatePipe]
})
export class TranslateSpecModule {}
