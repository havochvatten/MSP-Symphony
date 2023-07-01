import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreModule } from "@ngrx/store";
import { TranslateModule } from "@ngx-translate/core";
import { HttpClientModule } from "@angular/common/http";
import { AddScenarioAreasComponent } from './add-scenario-areas.component';

describe('AddScenarioAreasComponent', () => {
  let component: AddScenarioAreasComponent;
  let fixture: ComponentFixture<AddScenarioAreasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        StoreModule.forRoot({}, {}),
        TranslateModule.forRoot()
      ],
      declarations: [ AddScenarioAreasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddScenarioAreasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
