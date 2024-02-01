import {
  Component,
  Type,
  ViewChild,
  ComponentRef,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
  HostBinding
} from '@angular/core';
import { InsertionDirective } from './insertion.directive';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnDestroy, AfterViewInit {

  @HostBinding('class.app-dialog') dialogClass = true;

  constructor(
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  componentRef: ComponentRef<unknown> | undefined;
  childComponentType: Type<unknown> | undefined;

  @ViewChild(InsertionDirective)
  insertionPoint: InsertionDirective | undefined;

  private readonly _onClose = new Subject<unknown>();
  public onClose = this._onClose.asObservable();

  @HostBinding('attr.aria-role') ariaRole = 'dialog';

  ngAfterViewInit(): void {
    if (this.childComponentType) {
      this.loadChildComponent();
      this.changeDetectorRef.detectChanges();
    }
  }

  ngOnDestroy(): void {
    if (this.componentRef) {
      this.componentRef.destroy();
    }
  }

  loadChildComponent = () => {
    if (this.insertionPoint) {
      const viewContainerRef = this.insertionPoint.viewContainerRef;
      viewContainerRef.clear();
      this.componentRef = viewContainerRef.createComponent(this.childComponentType!);
    }
  };

  close = () => {
    this._onClose.next();
  };
}
