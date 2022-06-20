import { Directive, Output, EventEmitter, HostBinding, HostListener } from '@angular/core';

@Directive({
  selector: '[appDragDrop]'
})
export class DragDropDirective {

  @Output() fileDropped = new EventEmitter<any>();

  @HostBinding('style.background-color') private background = '#f5fcff';
  @HostBinding('style.opacity') private opacity = 1;

  @HostListener('dragover', ['$event']) onDragOver(event: any) {
    this.handleDrag(event, '#9ecbec', 0.8);
  }

  @HostListener('dragleave', ['$event']) public onDragLeave(event: any) {
    this.handleDrag(event, '#f5fcff', 1);
  }

  @HostListener('drop', ['$event']) public ondrop(event: any) {
    this.handleDrag(event, '#f5fcff', 1);
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      this.fileDropped.emit(files)
    }
  }

  private handleDrag(event: any, background: string, opacity: number) {
    event.preventDefault();
    event.stopPropagation();
    this.background = background;
    this.opacity = opacity;
  }

}
