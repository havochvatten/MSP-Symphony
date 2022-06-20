import { Subject, Observable } from 'rxjs';

export class DialogRef {
  private readonly _afterClosed = new Subject<any>();
  afterClosed: Observable<any> = this._afterClosed.asObservable();

  close = (result?: any) => {
    this._afterClosed.next(result);
  };
}
