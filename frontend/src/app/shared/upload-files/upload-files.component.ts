import { Component } from '@angular/core';

@Component({
  selector: 'app-upload-files',
  templateUrl: './upload-files.component.html',
  styleUrls: ['./upload-files.component.scss']
})
export class UploadFilesComponent {
  files: string[] = [];

  uploadFile(fileList: FileList) {
    for(const file of fileList) {
      this.files.push(file.name);
    }
  }

  deleteAttachment(index: number) {
    this.files.splice(index, 1);
  }
}
