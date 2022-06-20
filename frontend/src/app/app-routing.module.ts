import { AuthenticationGuard } from './login/authentication.guard';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainViewComponent } from './map-view/main-view.component';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(mod => mod.LoginModule)
  },
  {
    path: 'map', // TODO: rename to main
    component: MainViewComponent,
    canActivate: [AuthenticationGuard],
    data: { headerTitle: 'Symphony' },
  },
  {
    path: 'report',
    loadChildren: () => import('./report/calculation-report.module').then(mod =>
      mod.CalculationReportModule),
    canActivate: [AuthenticationGuard],
    //data: { headerTitle: 'Symphony' }
  },
  { path: '', redirectTo: '/map', pathMatch: 'full' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      routes,
      // { enableTracing: true } // <-- debugging purposes only
    )
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
