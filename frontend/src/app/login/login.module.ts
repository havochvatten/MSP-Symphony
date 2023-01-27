import { SharedModule } from './../shared/shared.module';
import { LoginRoutingModule } from './login-routing.module';
import { NgModule } from '@angular/core';
import { LoginComponent } from './login.component';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";

@NgModule({
  declarations: [LoginComponent],
  imports: [
    LoginRoutingModule,
    SharedModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule
  ],
  exports: []
})
export class LoginModule {}
