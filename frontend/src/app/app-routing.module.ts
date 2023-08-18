import { LoginComponent } from './login/login.component';
import { AuthenticationGuard } from './login/authentication.guard';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainViewComponent } from './map-view/main-view.component';
import { ComparisonReportComponent } from './report/comparison-report.component';
import { CalculationReportComponent } from './report/calculation-report.component';

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
    data: { headerTitle: 'Symphony' }
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
    // data: { headerTitle: 'Symphony' }
  },
  { path: '', redirectTo: '/map', pathMatch: 'full' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      routes,
      // { enableTracing: true } // <-- debugging purposes only
      { relativeLinkResolution: 'legacy' }
    )
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
