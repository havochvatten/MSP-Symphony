import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MetaInfoComponent } from './meta-info.component';
import { DialogRef } from "@shared/dialog/dialog-ref";
import { DialogConfig } from "@shared/dialog/dialog-config";
import { TranslateModule, TranslateService } from "@ngx-translate/core";

describe('MetaInfoComponent', () => {
  let component: MetaInfoComponent;
  let fixture: ComponentFixture<MetaInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ TranslateModule.forRoot() ],
      providers: [ TranslateService, DialogRef,
        {
          provide: DialogConfig,
          useValue: {
            data: {
              band: {
                title: '',
                statePath: [''],
                methodSummary: '',
                limitationsForSymphony: '',
                valueRange: '',
                dataProcessing: ''
              }
            }
          }
        }],
      declarations: [ MetaInfoComponent ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(MetaInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
