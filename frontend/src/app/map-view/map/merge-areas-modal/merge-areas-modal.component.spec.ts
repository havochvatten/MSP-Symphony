import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { DialogConfig } from "@shared/dialog/dialog-config";
import { DialogService } from "@shared/dialog/dialog.service";
import { DialogRef } from "@shared/dialog/dialog-ref";
import { MergeAreasModalComponent } from './merge-areas-modal.component';

describe('MergeAreasModalComponent', () => {
  let component: MergeAreasModalComponent;
  let fixture: ComponentFixture<MergeAreasModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports : [
        TranslateModule.forRoot()
      ],
      providers: [
        TranslateService,
        DialogService,
        DialogRef,
        {
          provide: DialogConfig,
          useValue: {
            data: {
              areas: [{ polygon: null }],
              paths: [],
              names: []
             }
          }
        }
      ],
      declarations: [ MergeAreasModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MergeAreasModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
