import { DialogRef } from './dialog-ref';
import { DialogInjector } from './dialog-injector';
import {
  Injectable,
  Injector,
  ApplicationRef,
  ComponentRef,
  EmbeddedViewRef,
  Type,
  NgModuleRef,
  ComponentFactoryResolver
} from '@angular/core';
import { DialogConfig } from './dialog-config';
import { DialogComponent } from './dialog.component';

@Injectable({ providedIn: 'root' })
export class DialogService {
  dialogComponentRef?: ComponentRef<DialogComponent>;
  constructor(
    private appRef: ApplicationRef,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {}

  private appendDialogComponentToBody = (injector: Injector, config?: DialogConfig) => {
    const map = new WeakMap();
    if (config) {
      map.set(DialogConfig, config);
    }

    const dialogRef = new DialogRef();
    map.set(DialogRef, dialogRef);

    const subscription = dialogRef.afterClosed.subscribe(() => {
      this.removeDialogComponentFromBody();
      subscription.unsubscribe();
    });

    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(DialogComponent);

    const componentRef = componentFactory.create(new DialogInjector(injector, map));

    this.appRef.attachView(componentRef.hostView);

    const domElement = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    document.body.appendChild(domElement);

    this.dialogComponentRef = componentRef;

    this.dialogComponentRef.instance.onClose.subscribe(() => {
      this.removeDialogComponentFromBody();
    });

    return dialogRef;
  };

  private removeDialogComponentFromBody = () => {
    if (this.dialogComponentRef) {
      this.appRef.detachView(this.dialogComponentRef.hostView);
      this.dialogComponentRef.destroy();
    }
  };

  public open<T>(componentType: Type<any>, moduleRef: NgModuleRef<any>, config?: DialogConfig) {
    const injector = moduleRef.injector;
    const dialogRef = this.appendDialogComponentToBody(injector, config);
    if (this.dialogComponentRef) {
      this.dialogComponentRef.instance.childComponentType = componentType;
    }
    return new Promise<T>((resolve, _) => {
      dialogRef.afterClosed.subscribe(resolve);
    });
  }
}
