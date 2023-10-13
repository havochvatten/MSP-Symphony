import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { DialogConfig } from "@shared/dialog/dialog-config";
import { DialogService } from "@shared/dialog/dialog.service";
import { DialogRef } from "@shared/dialog/dialog-ref";
import { MergeAreasModalComponent } from './merge-areas-modal.component';
import { InlineMapComponent } from "@shared/inline-map/inline-map.component";
import { SelectIntersectionComponent } from "@shared/select-intersection/select-intersection.component";

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
              areas: [{ polygon: { type: 'Polygon', coordinates: [[ [1968642.9769356516,8602586.72238989],
                                                                    [1972040.2056731333,8576154.595900387],
                                                                    [1972040.2221093003,8576154.466717938],
                                                                    [1972223.5578549802,8574696.183331992],
                                                                    [1997264.2359082627,8577432.979728607],
                                                                    [2005931.8428685423,8591412.169040134],
                                                                    [1994659.8331586616,8588305.422068749],
                                                                    [1994657.4742089056,8588305.289931314],
                                                                    [1994655.15468966,8588306.181163661],
                                                                    [1994652.978836611,8588308.055715488],
                                                                    [1994651.0444293036,8588310.829348003],
                                                                    [1980634.4623006012,8613381.413702758],
                                                                    [1968642.9769356516,8602586.72238989]]] } }],
              paths: [],
              names: []
             }
          }
        }
      ],
      declarations: [ SelectIntersectionComponent, MergeAreasModalComponent, InlineMapComponent ]
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
