import { AuthenticationGuard } from './login/authentication.guard';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainViewComponent } from './map-view/main-view.component';
import { environment } from "@src/environments/environment.prod";
import { ComparisonReportComponent } from './report/comparison-report.component';
import { CalculationReportComponent } from './report/calculation-report.component';
import { LoginComponent } from "@src/app/login/login.component";

const routes: Routes = [
  {
    path: 'login',
    // loadChildren: () => import('./login/login.module').then(mod => mod.LoginModule)
    component: LoginComponent
  },
  {
    path: 'map', // TODO: rename to main
    component: MainViewComponent,
    canActivate: [AuthenticationGuard],
    data: { headerTitle: environment.instanceName },
  },
  {
    path: 'report',
    // loadChildren: () =>
    //   import('./report/calculation-report.module').then(mod => mod.CalculationReportModule),
    children: [
      {
        path: 'compare/:aId/:bId',
        component: ComparisonReportComponent
      },
      {
        path: 'compareDynamic/:aId/:bId/:dynamicMax',
        component: ComparisonReportComponent,
      },
      {
        path: ':calcId',
        component: CalculationReportComponent
      }
    ],
    canActivate: [AuthenticationGuard]
    //data: { headerTitle: 'Symphony' }
  },
  { path: '', redirectTo: '/map', pathMatch: 'full' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      routes,
      // { enableTracing: true } // <-- debugging purposes only
      {}
    )
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
