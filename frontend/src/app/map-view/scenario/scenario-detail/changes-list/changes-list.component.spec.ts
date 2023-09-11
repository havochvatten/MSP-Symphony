import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { ChangesListComponent } from './changes-list.component';
import { IconComponent } from "@shared/icon/icon.component";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@data/metadata/metadata.reducers";


describe('ChangesListComponent', () => {
  let component: ChangesListComponent;
  let fixture: ComponentFixture<ChangesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ TranslateModule.forRoot() ],
      providers: [TranslateService,
            provideMockStore({ initialState: {
              metadata: initialState
            }})],
      declarations: [ ChangesListComponent, IconComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
