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
  ComponentFactoryResolver,
  inject,
  NgModule
} from '@angular/core';
import { DialogConfig } from './dialog-config';
import { DialogComponent } from './dialog.component';

@Injectable({ providedIn: 'root' })
export class DialogService {
  private readonly appRef = inject(ApplicationRef);
  private readonly componentFactoryResolver = inject(ComponentFactoryResolver);

  dialogRefs = new Map<DialogRef, ComponentRef<DialogComponent>>;

  private appendDialogComponentToBody = (injector: Injector, config?: DialogConfig) => {
    const map = new WeakMap();
    if (config) {
      map.set(DialogConfig, config);
    }

    const dialogRef = new DialogRef();
    map.set(DialogRef, dialogRef);

    const subscription = dialogRef.afterClosed.subscribe(() => {
      this.removeDialogComponentFromBody(dialogRef);
      subscription.unsubscribe();
    });

    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(DialogComponent);

    const componentRef = componentFactory.create(new DialogInjector(injector, map));

    this.appRef.attachView(componentRef.hostView);

    const domElement = (componentRef.hostView as EmbeddedViewRef<never>).rootNodes[0] as HTMLElement;
    document.body.appendChild(domElement);

    this.dialogRefs.set(dialogRef, componentRef);

    componentRef.instance.onClose.subscribe(() => {
      this.removeDialogComponentFromBody(dialogRef);
    });

    return dialogRef;
  };

  private removeDialogComponentFromBody = (dialog: DialogRef) => {
    const dialogComponentRef = this.dialogRefs.get(dialog);

    if (dialogComponentRef) {
      this.appRef.detachView(dialogComponentRef.hostView);
      dialogComponentRef.destroy();
    }
  };

  public open<T, M extends NgModule>(componentType: Type<unknown>, moduleRef: NgModuleRef<M>, config?: DialogConfig) {
    const injector = moduleRef.injector;
    const dialogRef = this.appendDialogComponentToBody(injector, config);
    if (this.dialogRefs.get(dialogRef)) {
      this.dialogRefs.get(dialogRef)!.instance.childComponentType = componentType;
    }
    return new Promise<T>((resolve) => {
      dialogRef.afterClosed.subscribe((result) => {
        resolve(result as T);
      });
    });
  }
}
