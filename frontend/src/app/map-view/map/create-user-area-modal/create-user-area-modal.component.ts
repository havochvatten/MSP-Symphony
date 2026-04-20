import { Component, OnInit } from '@angular/core';
import { DialogRef } from '@shared/dialog/dialog-ref';
import AreaService from '@data/area/area.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-create-user-area-modal',
  templateUrl: './create-user-area-modal.component.html',
  styleUrls: ['./create-user-area-modal.component.scss']
})
export class CreateUserAreaModalComponent implements OnInit {
  areaName = '';
  categories: { id: number; name: string }[] = [];
  isCreatingNew = false;

  categoryForm = new FormGroup({
    categoryId: new FormControl(''),
    newCategoryName: new FormControl('')
  });

  constructor(
    private dialog: DialogRef,
    private areaService: AreaService
  ) {}

  ngOnInit() {
    this.areaService.getCategories().subscribe(data => {
      this.categories = data.filter(c => c.id !== null);
    });
    this.categoryForm.get('categoryId')!.valueChanges.subscribe(value => {
      if (value === '__new__') {
        this.isCreatingNew = true;
        this.categoryForm.get('newCategoryName')!.setValidators(Validators.required);
      } else {
        this.isCreatingNew = false;
        this.categoryForm.get('newCategoryName')!.clearValidators();
      }
      this.categoryForm.get('newCategoryName')!.updateValueAndValidity();
    });
  }

  onChange(value: string) {
    this.areaName = value;
  }


  save() {
    const categoryIdValue = this.categoryForm.get('categoryId')!.value;

    if (categoryIdValue === '__new__') {
      const newName = this.categoryForm.get('newCategoryName')!.value!;
      this.areaService.createCategory(newName).subscribe(createdCategory => {
        this.dialog.close({ name: this.areaName, categoryId: createdCategory.id });
      });
    } else {
      const categoryId = categoryIdValue ? Number(categoryIdValue) : null;
      this.dialog.close({ name: this.areaName, categoryId });
    }
  }

  close = () => {
    this.dialog.close();
  };
}
