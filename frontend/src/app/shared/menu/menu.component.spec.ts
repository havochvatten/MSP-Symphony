import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MenuComponent } from './menu.component';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';

describe('MenuComponent', () => {
  let fixture: ComponentFixture<MenuComponent>,
      component: MenuComponent

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        FontAwesomeModule,
        TranslationSetupModule
      ],
      declarations: [MenuComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
