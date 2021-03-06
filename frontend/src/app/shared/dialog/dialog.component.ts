import {
  Component,
  Type,
  ViewChild,
  ComponentRef,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
  ComponentFactoryResolver,
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
  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private changeDetectorRef: ChangeDetectorRef
  ) {}
  componentRef: ComponentRef<any> | undefined;
  childComponentType: Type<any> | undefined;

  @ViewChild(InsertionDirective)
  insertionPoint: InsertionDirective | undefined;

  private readonly _onClose = new Subject<any>();
  public onClose = this._onClose.asObservable();

  @HostBinding('attr.aria-role') ariaRole = 'dialog';

  ngAfterViewInit(): void {
    if (this.childComponentType) {
      this.loadChildComponent(this.childComponentType);
      this.changeDetectorRef.detectChanges();
    }
  }

  ngOnDestroy(): void {
    if (this.componentRef) {
      this.componentRef.destroy();
    }
  }

  loadChildComponent = (componentType: Type<any>) => {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(componentType);
    if (this.insertionPoint) {
      const viewContainerRef = this.insertionPoint.viewContainerRef;
      viewContainerRef.clear();
      this.componentRef = viewContainerRef.createComponent(componentFactory);
    }
  };

  close = () => {
    this._onClose.next();
  };
}
