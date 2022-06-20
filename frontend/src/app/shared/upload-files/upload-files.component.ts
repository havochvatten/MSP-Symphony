import { Component } from '@angular/core';

@Component({
  selector: 'app-upload-files',
  templateUrl: './upload-files.component.html',
  styleUrls: ['./upload-files.component.scss']
})
export class UploadFilesComponent {
  files: any = [];

  uploadFile(event: any) {
    event.forEach((element: any) => {
      this.files.push(element.name)
    });
  }

  deleteAttachment(index: number) {
    this.files.splice(index, 1);
  }
}
