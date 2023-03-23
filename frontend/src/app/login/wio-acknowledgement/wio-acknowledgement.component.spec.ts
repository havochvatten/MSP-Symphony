import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WioAcknowledgementComponent } from './wio-acknowledgement.component';
import { TranslateModule } from "@ngx-translate/core";

describe('WioAcknowledgementComponent', () => {
  let component: WioAcknowledgementComponent;
  let fixture: ComponentFixture<WioAcknowledgementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports : [ TranslateModule.forRoot() ],
      declarations: [ WioAcknowledgementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WioAcknowledgementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
