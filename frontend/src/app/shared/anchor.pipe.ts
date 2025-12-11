import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: 'anchor',
  standalone: false
})
export class AnchorPipe implements PipeTransform {

  private urlRx = /(https?:\/\/[^ ]*)/g;
  private anchorRpl = '<a href="$1" target="_blank">$1</a>';

  transform(value: string): string {
    return value.replace(this.urlRx, this.anchorRpl);
  }
}
