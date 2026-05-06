import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SharedModule } from '@shared/shared.module';

import { AreaGroupComponent, EditAreaComponent } from './area-group.component';
import { TranslationSetupModule } from "@src/app/app-translation-setup.module";
import { provideMockStore } from "@ngrx/store/testing";
import { UserAreaCategoryState } from '@data/area/area.interfaces';

describe('AreaGroupComponent', () => {
  let fixture: ComponentFixture<AreaGroupComponent>,
      component: AreaGroupComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AreaGroupComponent, EditAreaComponent ],
      imports: [ SharedModule, TranslationSetupModule ],
      providers: [provideMockStore({ initialState : { user: {} } })]
    }).compileComponents();
    fixture = TestBed.createComponent(AreaGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getAreas should return array when areas is already an array', () => {
    const group = {
      areas: [{ id: 1, name: 'test' }]
    };
    const result = component.getAreas(group);
    expect(Array.isArray(result)).toBeTrue();
    expect(result.length).toBe(1);
  });

  it('getAreas should convert object to array', () => {
    const group = {
      areas: { 1: { id: 1, name: 'test' }, 2: { id: 2, name: 'test2' } }
    };
    const result = component.getAreas(group);
    expect(Array.isArray(result)).toBeTrue();
    expect(result.length).toBe(2);
  });

  it('onDeleteUserAreaCategory should call deleteUserAreaCategory with correct id', () => {
    let calledWith: number | undefined;
    component.deleteUserAreaCategory = (id: number) => { calledWith = id; };
    component.onDeleteUserAreaCategory(5)();
    expect(calledWith).toBe(5);
  });

  it('onRenameUserAreaCategory should call renameUserAreaCategory with correct args', () => {
    let calledId: number | undefined;
    let calledName: string | undefined;
    component.renameUserAreaCategory = (id: number, name: string) => {
      calledId = id;
      calledName = name;
    };
    component.onRenameUserAreaCategory(3, 'TestName')();
    expect(calledId).toBe(3);
    expect(calledName).toBe('TestName');
  });

  it('onMoveUserArea should call moveUserArea with correct area', () => {
    let calledArea: any = null;
    component.moveUserArea = (area: any) => { calledArea = area; };
    const testArea = { id: 1, name: 'rivers' } as any;
    component.onMoveUserArea(testArea)();
    expect(calledArea).toBe(testArea);
  });

  it('should show only one edit button without rename/delete for groups with null id', () => {
  component.userArea = true;
  component.areas = [{
    id: null,
    name: 'Uncategorized',
    visible: true,
    expanded: false,
    statePath: ['userArea', 'categories', 'uncategorized'],
    areas: {}
  }] as any;
  fixture.detectChanges();
  const editButtons = fixture.nativeElement.querySelectorAll('app-edit-area.edit-category');
  expect(editButtons.length).toBe(1);
  });

});
