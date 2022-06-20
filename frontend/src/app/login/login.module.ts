import { SharedModule } from './../shared/shared.module';
import { LoginRoutingModule } from './login-routing.module';
import { NgModule } from '@angular/core';
import { LoginComponent } from './login.component';
import { HavFormFieldModule, HavButtonModule } from 'hav-components';

@NgModule({
  declarations: [LoginComponent],
  imports: [
    HavFormFieldModule,
    HavButtonModule,
    LoginRoutingModule,
    SharedModule
  ],
  exports: []
})
export class LoginModule {}
