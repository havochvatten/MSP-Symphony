import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FooterComponent } from './footer.component';
import {
  TranslateModule,
  TranslateService
} from "@ngx-translate/core";

describe('FooterComponent', () => {
  let fixture: ComponentFixture<FooterComponent>,
      component: FooterComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ TranslateModule.forRoot() ],
      providers:[
        TranslateService,
      ],
      declarations: [ FooterComponent ]
    }).compileComponents();
    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
