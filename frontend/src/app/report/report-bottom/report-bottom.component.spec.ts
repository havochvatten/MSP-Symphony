import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportBottomComponent } from './report-bottom.component';
import { TranslateModule } from "@ngx-translate/core";

describe('ReportBottomComponent', () => {
  let component: ReportBottomComponent;
  let fixture: ComponentFixture<ReportBottomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports : [ TranslateModule.forRoot() ],
      declarations: [ ReportBottomComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportBottomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
