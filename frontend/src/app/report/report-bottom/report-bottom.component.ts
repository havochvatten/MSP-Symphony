import { Component, Input } from '@angular/core';
import { environment as env } from "@src/environments/environment";
import buildInfo from '@src/build-info';

@Component({
  selector: 'app-report-bottom',
  templateUrl: './report-bottom.component.html',
  styleUrls: ['./report-bottom.component.scss']
})
export class ReportBottomComponent {
  @Input() formattedDate = "";

  env = env;
  buildInfo = buildInfo;
}
