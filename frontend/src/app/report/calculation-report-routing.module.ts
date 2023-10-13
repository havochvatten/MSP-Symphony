import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CalculationReportComponent } from './calculation-report.component';
import { ComparisonReportComponent } from "@src/app/report/comparison-report.component";

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'compare/:aId/:bId',
        component: ComparisonReportComponent,

      },
      {
        path: 'compareDynamic/:aId/:bId/:dynamicMax',
        component: ComparisonReportComponent,
      },
      {
        path: ':calcId',
        component: CalculationReportComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CalculationReportRoutingModule {}
