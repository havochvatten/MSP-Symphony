import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutDialogComponent } from './about-dialog.component';
import { DialogRef } from "@shared/dialog/dialog-ref";
import { TranslateModule } from "@ngx-translate/core";
import { SharedModule } from "@shared/shared.module";
import { provideMockStore } from "@ngrx/store/testing";
import { provideZonelessChangeDetection } from "@angular/core";

class MockDialogRef {
  close = () => {}
}

describe('AboutDialogComponentComponent', () => {
  let component: AboutDialogComponent;
  let fixture: ComponentFixture<AboutDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), SharedModule],
      declarations: [ AboutDialogComponent ],
      providers: [
        { provide: DialogRef, useClass: MockDialogRef },
        provideMockStore({
          initialState : { user: {} }
        }),
        provideZonelessChangeDetection()
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows the funding block last, above the close button', () => {
    const host: HTMLElement = fixture.nativeElement;
    const block = host.querySelector('#funding-disclaimer')!;
    expect(block).not.toBeNull();
    expect(block.querySelector('h3')!.textContent).toContain('funding-disclaimer.heading');
    expect(block.querySelectorAll('app-funding-disclaimer p').length).toBe(3);
    expect(block.querySelector('img')!.getAttribute('src')).toBe('assets/funding/sweden-swam.png');
    expect(block.previousElementSibling!.id).toBe('third-party-container');
    expect(block.nextElementSibling!.classList).toContain('toolbar');
  });

  it('shows the funding logo at no less than its natural width, so the agency name stays legible', async () => {
    document.body.appendChild(fixture.nativeElement);
    const img: HTMLImageElement = fixture.nativeElement.querySelector('#funding-disclaimer img');
    await img.decode();
    expect(img.getBoundingClientRect().width).toBeGreaterThanOrEqual(img.naturalWidth);
    fixture.nativeElement.remove();
  });

  it('stays within 90% of the window, padding included', () => {
    document.body.appendChild(fixture.nativeElement);
    const box = (fixture.nativeElement as HTMLElement).getBoundingClientRect();
    expect(box.width).toBeLessThanOrEqual(window.innerWidth * 0.9 + 0.5);
    expect(box.height).toBeLessThanOrEqual(window.innerHeight * 0.9 + 0.5);
    fixture.nativeElement.remove();
  });
});
