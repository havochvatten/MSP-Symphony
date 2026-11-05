import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatInputModule } from '@angular/material/input';
import { DialogRef } from '@shared/dialog/dialog-ref';
import { DialogConfig } from '@shared/dialog/dialog-config';
import { NewScenarioNameComponent } from './new-scenario-name.component';

describe('NewScenarioNameComponent', () => {
  const suggestedName = 'Scenario Kattegatt 2';
  let fixture: ComponentFixture<NewScenarioNameComponent>;
  let dialogRef: DialogRef;
  let input: HTMLInputElement;
  let opener: HTMLButtonElement;

  const button = (name: string) =>
    fixture.nativeElement.querySelector(`button[data-test="${name}"]`) as HTMLButtonElement;

  const typeName = (value: string) => {
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };

  const pressKey = (target: EventTarget, key: string) =>
    target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));

  beforeEach(async () => {
    opener = document.createElement('button');
    document.body.appendChild(opener);
    opener.focus();

    dialogRef = new DialogRef();
    spyOn(dialogRef, 'close');

    await TestBed.configureTestingModule({
      imports: [MatInputModule, TranslateModule.forRoot()],
      providers: [
        { provide: DialogRef, useValue: dialogRef },
        { provide: DialogConfig, useValue: { data: { suggestedName } } },
        provideZonelessChangeDetection()
      ],
      declarations: [NewScenarioNameComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(NewScenarioNameComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    input = fixture.nativeElement.querySelector('input');
  });

  afterEach(() => opener.remove());

  it('prefills the suggested name', () => {
    expect(input.value).toBe(suggestedName);
  });

  it('focuses the name field with the text selected', () => {
    expect(document.activeElement).toBe(input);
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe(suggestedName.length);
  });

  it('creates with the trimmed name', () => {
    typeName('  My plan  ');
    button('create').click();
    expect(dialogRef.close).toHaveBeenCalledWith('My plan');
  });

  it('creates on Enter', () => {
    pressKey(input, 'Enter');
    expect(dialogRef.close).toHaveBeenCalledWith(suggestedName);
  });

  it('cancels with null', () => {
    button('cancel').click();
    expect(dialogRef.close).toHaveBeenCalledWith(null);
  });

  it('cancels on Escape', () => {
    pressKey(document, 'Escape');
    expect(dialogRef.close).toHaveBeenCalledWith(null);
  });

  it('disables Create and ignores Enter when the name is blank', () => {
    typeName('   ');
    expect(button('create').disabled).toBeTrue();
    pressKey(input, 'Enter');
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('labels the name field for screen readers', () => {
    expect(input.getAttribute('aria-label')).toBe('map.editor.new-scenario.name-label');
  });

  it('returns focus to the element that opened it when closed', () => {
    fixture.destroy();
    expect(document.activeElement).toBe(opener);
  });
});
