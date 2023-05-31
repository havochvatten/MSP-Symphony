import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { ChangesListComponent } from './changes-list.component';


describe('ChangesListComponent', () => {
  let component: ChangesListComponent;
  let fixture: ComponentFixture<ChangesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ TranslateModule.forRoot() ],
      providers: [ TranslateService ],
      declarations: [ ChangesListComponent ]
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
