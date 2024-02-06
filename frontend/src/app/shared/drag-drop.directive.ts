import { Directive, Output, EventEmitter, HostBinding, HostListener } from '@angular/core';

@Directive({
  selector: '[appDragDrop]'
})
export class DragDropDirective {

  @Output() fileDropped = new EventEmitter<FileList>();

  @HostBinding('style.background-color') private background = '#f5fcff';
  @HostBinding('style.opacity') private opacity = 1;

  @HostListener('dragover', ['$event']) onDragOver(event: DragEvent) {
    this.handleDrag(event, '#9ecbec', 0.8);
  }

  @HostListener('dragleave', ['$event']) public onDragLeave(event: DragEvent) {
    this.handleDrag(event, '#f5fcff', 1);
  }

  @HostListener('drop', ['$event']) public ondrop(event: DragEvent) {
    this.handleDrag(event, '#f5fcff', 1);
    if(event.dataTransfer !== null) {
      const files = event.dataTransfer.files;
      if (files.length > 0) {
        this.fileDropped.emit(files)
      }
    }
  }

  private handleDrag(event: DragEvent, background: string, opacity: number) {
    event.preventDefault();
    event.stopPropagation();
    this.background = background;
    this.opacity = opacity;
  }

}
