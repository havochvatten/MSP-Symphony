import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MetaInfoComponent } from './meta-info.component';
import { AnchorPipe } from "@shared/anchor.pipe";
import { DialogRef } from "@shared/dialog/dialog-ref";
import { DialogConfig } from "@shared/dialog/dialog-config";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { IconComponent } from "@shared/icon/icon.component";

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
                meta: {
                  methodSummary: '',
                  limitationsForSymphony: '',
                  valueRange: '',
                  dataProcessing: ''
                }
              }
            }
          }
        }],
      declarations: [ MetaInfoComponent, AnchorPipe, IconComponent ]
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
