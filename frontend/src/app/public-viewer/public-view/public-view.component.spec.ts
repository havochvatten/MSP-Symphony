import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicView } from './public-view.component';

describe('PublicView', () => {
  let component: PublicView;
  let fixture: ComponentFixture<PublicView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicView]
    }).compileComponents();

    fixture = TestBed.createComponent(PublicView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
